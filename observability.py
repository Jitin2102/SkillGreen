from __future__ import annotations

import json
import logging
import os
import sys
from collections.abc import Callable
from datetime import UTC, datetime

from middleware.security import request_id_var

_SENSITIVE_HEADERS = {
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "x-csrf-token",
}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "ts": datetime.fromtimestamp(record.created, UTC).isoformat(
                timespec="milliseconds"
            ),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "request_id": request_id_var.get(),
        }
        if record.exc_info:
            entry["exc"] = self.formatException(record.exc_info)
        return json.dumps(entry, default=str)


def configure_logging(level: str | None = None) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel((level or os.getenv("LOG_LEVEL", "INFO")).upper())
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        lg = logging.getLogger(name)
        lg.handlers[:] = []
        lg.propagate = True


def scrub_event(event: dict, hint=None) -> dict:
    req = event.get("request")
    if req:
        req.pop("data", None)
        req.pop("cookies", None)
        req.pop("query_string", None)
        headers = req.get("headers")
        if isinstance(headers, dict):
            req["headers"] = {
                k: ("[Filtered]" if k.lower() in _SENSITIVE_HEADERS else v)
                for k, v in headers.items()
            }
    event.pop("user", None)
    return event


def init_sentry(release: str | None = None) -> bool:
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        return False
    import sentry_sdk

    sentry_sdk.init(
        dsn=dsn,
        environment=os.getenv("APP_ENV", "production"),
        release=release or os.getenv("RENDER_GIT_COMMIT"),
        send_default_pii=False,
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.0")),
        before_send=scrub_event,
    )
    return True


def make_health_router(check_db: Callable[[], None]):
    from fastapi import APIRouter, Response

    router = APIRouter(tags=["health"])

    @router.get("/health", include_in_schema=False)
    def health():
        return {"status": "ok"}

    @router.get("/ready", include_in_schema=False)
    def ready(response: Response):
        try:
            check_db()
        except Exception:
            logging.getLogger(__name__).exception("readiness check failed")
            response.status_code = 503
            return {"status": "unavailable"}
        return {"status": "ok"}

    return router
