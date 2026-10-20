from __future__ import annotations

import json
import math
import os
import re
import time
import uuid
from collections import deque
from collections.abc import Callable
from contextvars import ContextVar
from dataclasses import dataclass

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")
_REQUEST_ID_OK = re.compile(r"^[A-Za-z0-9._-]{8,64}$")


def _get_header(scope: dict, name: bytes) -> str | None:
    for k, v in scope.get("headers", []):
        if k.lower() == name:
            return v.decode("latin-1")
    return None


def _set_header(headers: list, name: bytes, value: str, overwrite: bool = True) -> None:
    for i, (k, _) in enumerate(headers):
        if k.lower() == name:
            if overwrite:
                headers[i] = (name, value.encode("latin-1"))
            return
    headers.append((name, value.encode("latin-1")))


async def _respond(
    send, status: int, detail: str, extra: list[tuple[bytes, bytes]] | None = None
) -> None:
    body = json.dumps({"detail": detail}).encode()
    headers = [
        (b"content-type", b"application/json"),
        (b"content-length", str(len(body)).encode()),
        *(extra or []),
    ]
    await send({"type": "http.response.start", "status": status, "headers": headers})
    await send({"type": "http.response.body", "body": body})


# request ID middleware: add X-Request-ID to every response, and make it available to logging via request_id_var
class RequestIdMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        incoming = _get_header(scope, b"x-request-id")
        rid = (
            incoming
            if incoming and _REQUEST_ID_OK.match(incoming)
            else uuid.uuid4().hex
        )
        scope.setdefault("state", {})["request_id"] = rid
        token = request_id_var.set(rid)

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                _set_header(headers, b"x-request-id", rid)
                message = {**message, "headers": headers}
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            request_id_var.reset(token)


## security headers: HSTS, nosniff, frame deny, referrer/permissions policy, API-safe CSP, no-store
class SecurityHeadersMiddleware:
    """API defaults. Swagger UI (/docs, /redoc) needs CDN scripts, so those paths get no CSP; better: disable docs in production."""

    def __init__(
        self,
        app,
        hsts: bool = True,
        csp_exempt_prefixes: tuple[str, ...] = ("/docs", "/redoc"),
    ):
        self.app = app
        self.hsts = hsts
        self.csp_exempt = csp_exempt_prefixes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        path = scope.get("path", "")
        is_docs = (
            any(path.startswith(p) for p in self.csp_exempt) or path == "/openapi.json"
        )

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                h = list(message.get("headers", []))
                _set_header(h, b"x-content-type-options", "nosniff")
                _set_header(h, b"x-frame-options", "DENY")
                _set_header(h, b"referrer-policy", "strict-origin-when-cross-origin")
                _set_header(
                    h, b"permissions-policy", "camera=(), microphone=(), geolocation=()"
                )
                if self.hsts:
                    _set_header(
                        h,
                        b"strict-transport-security",
                        "max-age=31536000; includeSubDomains",
                    )
                if not is_docs:
                    _set_header(
                        h,
                        b"content-security-policy",
                        "default-src 'none'; frame-ancestors 'none'",
                    )
                    _set_header(
                        h, b"cache-control", "no-store", overwrite=False
                    )  # personal data must not be cached
                message = {**message, "headers": h}
            await send(message)

        await self.app(scope, receive, send_wrapper)


# --------------------------------------------------------------------------- rate limiting
@dataclass(frozen=True)
class Rule:
    prefix: str
    limit: int  # max requests ...
    window: float  # ... per this many seconds


DEFAULT_RULES: tuple[Rule, ...] = (
    Rule("/auth/otp", 20, 600),
    Rule("/auth", 40, 60),
    Rule("/resume/upload", 10, 600),
    Rule("/", 240, 60),
)


def client_ip(scope: dict, trusted_hops: int) -> str:
    """With trusted_hops=N, take the Nth address from the RIGHT of X-Forwarded-For: each trusted proxy appends the address it
    saw, so entries further left can be forged by the client. Render adds one hop (use 2 if Cloudflare is also in front)."""
    if trusted_hops > 0:
        xff = _get_header(scope, b"x-forwarded-for")
        if xff:
            parts = [p.strip() for p in xff.split(",") if p.strip()]
            if len(parts) >= trusted_hops:
                return parts[-trusted_hops]
    client = scope.get("client")
    return client[0] if client else "unknown"


class RateLimitMiddleware:
    def __init__(
        self,
        app,
        rules: tuple[Rule, ...] = DEFAULT_RULES,
        trusted_hops: int = 1,
        exempt: tuple[str, ...] = ("/health", "/ready"),
        clock: Callable[[], float] = time.monotonic,
        max_keys: int = 50_000,
    ):
        self.app, self.rules, self.hops, self.exempt = app, rules, trusted_hops, exempt
        self.clock, self.max_keys = clock, max_keys
        self._hits: dict[tuple[str, str], deque[float]] = {}

    def _match(self, path: str) -> Rule | None:
        best = None
        for r in self.rules:
            if (
                r.prefix == "/"
                or path == r.prefix
                or path.startswith(r.prefix.rstrip("/") + "/")
            ):
                if best is None or len(r.prefix) > len(best.prefix):
                    best = r
        return best

    def _purge(self, now: float) -> None:
        window = max((r.window for r in self.rules), default=0)
        for key in [
            k for k, dq in self._hits.items() if not dq or dq[-1] <= now - window
        ]:
            del self._hits[key]
        while len(self._hits) > self.max_keys:
            del self._hits[next(iter(self._hits))]

    def _hit(self, ip: str, rule: Rule) -> int | None:
        """None if allowed, else seconds until retry. No awaits inside: atomic under asyncio."""
        now = self.clock()
        if len(self._hits) >= self.max_keys:
            self._purge(now)
        dq = self._hits.setdefault((ip, rule.prefix), deque())
        while dq and dq[0] <= now - rule.window:
            dq.popleft()
        if len(dq) >= rule.limit:
            return max(1, math.ceil(dq[0] + rule.window - now))
        dq.append(now)
        return None

    async def __call__(self, scope, receive, send):
        if (
            scope["type"] != "http"
            or scope.get("method") == "OPTIONS"
            or any(scope.get("path", "").startswith(p) for p in self.exempt)
        ):
            return await self.app(scope, receive, send)
        rule = self._match(scope.get("path", ""))
        if rule:
            retry = self._hit(client_ip(scope, self.hops), rule)
            if retry is not None:
                return await _respond(
                    send,
                    429,
                    "Too many requests. Please slow down and try again shortly.",
                    [(b"retry-after", str(retry).encode())],
                )
        await self.app(scope, receive, send)


# --------------------------------------------------------------------------- body size
class _TooLarge(Exception):
    pass


class BodySizeLimitMiddleware:
    def __init__(
        self, app, default_max: int = 1_048_576, overrides: dict[str, int] | None = None
    ):
        self.app, self.default_max, self.overrides = app, default_max, overrides or {}

    def _limit(self, path: str) -> int:
        for prefix, limit in sorted(self.overrides.items(), key=lambda kv: -len(kv[0])):
            if path.startswith(prefix):
                return limit
        return self.default_max

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        limit = self._limit(scope.get("path", ""))
        declared = _get_header(scope, b"content-length")
        if declared and declared.isdigit() and int(declared) > limit:
            return await _respond(
                send, 413, f"Request body too large (max {limit} bytes)."
            )

        received, started = 0, False

        async def limited_receive():
            nonlocal received
            msg = await receive()
            if msg["type"] == "http.request":
                received += len(msg.get("body", b""))
                if received > limit:
                    raise _TooLarge()
            return msg

        async def tracking_send(message):
            nonlocal started
            if message["type"] == "http.response.start":
                started = True
            await send(message)

        try:
            await self.app(scope, limited_receive, tracking_send)
        except _TooLarge:
            if started:
                raise
            await _respond(send, 413, f"Request body too large (max {limit} bytes).")


# --------------------------------------------------------------------------- install
def _env_bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


def apply_security(
    app,
    *,
    rules: tuple[Rule, ...] = DEFAULT_RULES,
    max_body: int = 1_048_576,
    upload_prefix: str = "/resume/upload",
    max_upload: int | None = None,
) -> None:
    """Env switches: RATE_LIMIT_ENABLED (default true; set false in the test environment), TRUSTED_PROXY_HOPS (default 1),
    MAX_UPLOAD_BYTES (default 6 MB)."""
    max_upload = max_upload or int(os.getenv("MAX_UPLOAD_BYTES", str(6 * 1024 * 1024)))
    app.add_middleware(
        BodySizeLimitMiddleware,
        default_max=max_body,
        overrides={upload_prefix: max_upload},
    )
    if _env_bool("RATE_LIMIT_ENABLED", True):
        app.add_middleware(
            RateLimitMiddleware,
            rules=rules,
            trusted_hops=int(os.getenv("TRUSTED_PROXY_HOPS", "1")),
        )
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestIdMiddleware)  # added last = outermost of these four
