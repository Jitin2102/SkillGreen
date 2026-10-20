"""Tests for middleware/security.py and observability.py (no framework needed). Run: pytest tests/test_hardening.py"""

import asyncio
import json
import logging

from middleware.security import (
    BodySizeLimitMiddleware,
    RateLimitMiddleware,
    RequestIdMiddleware,
    Rule,
    SecurityHeadersMiddleware,
    client_ip,
    request_id_var,
)
from observability import JsonFormatter, scrub_event


async def echo_app(scope, receive, send):
    """Reads the whole body, then answers 200 with the byte count."""
    total = 0
    while True:
        msg = await receive()
        total += len(msg.get("body", b""))
        if not msg.get("more_body"):
            break
    body = json.dumps({"bytes": total, "rid": request_id_var.get()}).encode()
    await send(
        {
            "type": "http.response.start",
            "status": 200,
            "headers": [(b"content-type", b"application/json")],
        }
    )
    await send({"type": "http.response.body", "body": body})


def call(
    app, path="/x", method="GET", headers=None, chunks=(b"",), client=("1.2.3.4", 5555)
):
    sent = []
    queue = list(chunks)

    async def receive():
        chunk = queue.pop(0) if queue else b""
        return {"type": "http.request", "body": chunk, "more_body": bool(queue)}

    async def send(m):
        sent.append(m)

    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "client": client,
        "headers": [
            (k.lower().encode(), v.encode()) for k, v in (headers or {}).items()
        ],
    }
    asyncio.run(app(scope, receive, send))
    start = next(m for m in sent if m["type"] == "http.response.start")
    body = b"".join(
        m.get("body", b"") for m in sent if m["type"] == "http.response.body"
    )
    return start["status"], {k.decode(): v.decode() for k, v in start["headers"]}, body


# ---------- headers ----------
def test_security_headers_present_and_cache_not_overridden():
    status, h, _ = call(SecurityHeadersMiddleware(echo_app))
    assert (
        status == 200
        and h["x-content-type-options"] == "nosniff"
        and h["x-frame-options"] == "DENY"
    )
    assert (
        "max-age" in h["strict-transport-security"]
        and "frame-ancestors 'none'" in h["content-security-policy"]
    )
    assert h["cache-control"] == "no-store"

    async def cached(scope, receive, send):
        await send(
            {
                "type": "http.response.start",
                "status": 200,
                "headers": [(b"cache-control", b"max-age=60")],
            }
        )
        await send({"type": "http.response.body", "body": b""})

    assert call(SecurityHeadersMiddleware(cached))[1]["cache-control"] == "max-age=60"


def test_docs_paths_skip_csp():
    _, h, _ = call(SecurityHeadersMiddleware(echo_app), path="/docs")
    assert (
        "content-security-policy" not in h and h["x-content-type-options"] == "nosniff"
    )


# ---------- request id ----------
def test_request_id_generated_and_visible_to_app():
    _, h, body = call(RequestIdMiddleware(echo_app))
    assert len(h["x-request-id"]) == 32 and json.loads(body)["rid"] == h["x-request-id"]


def test_valid_incoming_request_id_is_kept_and_garbage_is_replaced():
    assert (
        call(RequestIdMiddleware(echo_app), headers={"X-Request-ID": "abc-12345678"})[
            1
        ]["x-request-id"]
        == "abc-12345678"
    )
    evil = call(
        RequestIdMiddleware(echo_app), headers={"X-Request-ID": "x\ninjected: 1"}
    )[1]["x-request-id"]
    assert evil != "x\ninjected: 1" and len(evil) == 32


# ---------- rate limiting ----------
class Clock:
    t = 1000.0

    def __call__(self):
        return self.t


def test_rate_limit_blocks_then_recovers_after_window():
    clock = Clock()
    app = RateLimitMiddleware(echo_app, rules=(Rule("/", 3, 60),), clock=clock)
    assert [call(app)[0] for _ in range(3)] == [200, 200, 200]
    status, h, body = call(app)
    assert status == 429 and int(h["retry-after"]) == 60 and b"Too many" in body
    clock.t += 61
    assert call(app)[0] == 200


def test_rate_limit_is_per_ip_and_per_rule():
    app = RateLimitMiddleware(
        echo_app, rules=(Rule("/auth/otp", 1, 60), Rule("/", 100, 60)), clock=Clock()
    )
    assert call(app, "/auth/otp/request", client=("9.9.9.9", 1))[0] == 200
    assert call(app, "/auth/otp/request", client=("9.9.9.9", 1))[0] == 429
    assert (
        call(app, "/auth/otp/request", client=("8.8.8.8", 1))[0] == 200
    )  # different IP unaffected
    assert (
        call(app, "/profile", client=("9.9.9.9", 1))[0] == 200
    )  # different rule unaffected


def test_longest_prefix_wins_and_boundaries_respected():
    app = RateLimitMiddleware(
        echo_app,
        rules=(Rule("/auth", 100, 60), Rule("/auth/otp", 1, 60)),
        clock=Clock(),
    )
    assert app._match("/auth/otp/verify").prefix == "/auth/otp"
    assert app._match("/auth/google").prefix == "/auth"
    assert app._match("/authentic") is None  # '/authentic' must not fall under '/auth'


def test_health_and_options_are_exempt():
    app = RateLimitMiddleware(echo_app, rules=(Rule("/", 1, 60),), clock=Clock())
    assert all(call(app, "/health")[0] == 200 for _ in range(5))
    assert all(call(app, "/profile", method="OPTIONS")[0] == 200 for _ in range(5))


def test_forged_forwarded_for_cannot_dodge_limit():
    app = RateLimitMiddleware(
        echo_app, rules=(Rule("/", 1, 60),), trusted_hops=1, clock=Clock()
    )
    real = {
        "X-Forwarded-For": "6.6.6.6, 203.0.113.7"
    }  # last entry added by the trusted proxy
    assert call(app, headers=real)[0] == 200
    forged = {
        "X-Forwarded-For": "1.1.1.1, 203.0.113.7"
    }  # attacker rotates the left-hand value
    assert call(app, headers=forged)[0] == 429


def test_client_ip_fallbacks():
    scope = {"headers": [], "client": ("5.5.5.5", 1)}
    assert (
        client_ip(scope, 1) == "5.5.5.5" and client_ip({"headers": []}, 1) == "unknown"
    )
    assert (
        client_ip(
            {"headers": [(b"x-forwarded-for", b"7.7.7.7")], "client": ("5.5.5.5", 1)}, 0
        )
        == "5.5.5.5"
    )


def test_memory_is_bounded():
    app = RateLimitMiddleware(
        echo_app, rules=(Rule("/", 5, 60),), clock=Clock(), max_keys=50
    )
    for i in range(200):
        call(app, client=(f"10.0.{i // 250}.{i % 250}", 1))
    assert len(app._hits) <= 51


# ---------- body size ----------
def test_declared_oversize_rejected_without_reading():
    app = BodySizeLimitMiddleware(echo_app, default_max=10)
    assert (
        call(app, method="POST", headers={"Content-Length": "11"}, chunks=(b"x" * 11,))[
            0
        ]
        == 413
    )


def test_streamed_oversize_rejected_and_small_body_accepted():
    app = BodySizeLimitMiddleware(echo_app, default_max=10)
    assert (
        call(app, method="POST", chunks=(b"x" * 6, b"x" * 6))[0] == 413
    )  # no content-length header
    status, _, body = call(app, method="POST", chunks=(b"x" * 5, b"x" * 5))
    assert status == 200 and json.loads(body)["bytes"] == 10


def test_override_applies_to_upload_prefix_only():
    app = BodySizeLimitMiddleware(
        echo_app, default_max=10, overrides={"/resume/upload": 100}
    )
    assert call(app, "/resume/upload", "POST", chunks=(b"x" * 50,))[0] == 200
    assert call(app, "/profile", "POST", chunks=(b"x" * 50,))[0] == 413


# ---------- observability ----------
def test_json_log_line_has_request_id():
    token = request_id_var.set("req-abc12345")
    try:
        rec = logging.LogRecord("t", logging.INFO, "f", 1, "hello %s", ("world",), None)
        out = json.loads(JsonFormatter().format(rec))
    finally:
        request_id_var.reset(token)
    assert (
        out["msg"] == "hello world"
        and out["request_id"] == "req-abc12345"
        and out["level"] == "INFO"
    )


def test_sentry_scrubber_removes_personal_data():
    event = {
        "request": {
            "data": {"otp": "123456"},
            "cookies": {"s": "x"},
            "query_string": "email=a@b.c",
            "headers": {"Authorization": "Bearer secret", "Accept": "json"},
        },
        "user": {"email": "a@b.c"},
    }
    out = scrub_event(event)
    assert (
        "data" not in out["request"]
        and "cookies" not in out["request"]
        and "user" not in out
    )
    assert out["request"]["headers"] == {
        "Authorization": "[Filtered]",
        "Accept": "json",
    }
