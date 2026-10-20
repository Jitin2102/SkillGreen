import os
import random
from urllib.parse import urlparse

from locust import HttpUser, between, events, task

TOKEN = os.getenv("LOADTEST_TOKEN", "")
LOCAL_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0", "host.docker.internal"}


@events.test_start.add_listener
def guard_target(environment, **_):
    host = urlparse(environment.host or "").hostname or ""
    if host not in LOCAL_HOSTS and os.getenv("LOADTEST_ALLOW_REMOTE") != "1":
        raise SystemExit(
            f"Refusing to load-test remote host {host!r}. Set LOADTEST_ALLOW_REMOTE=1 if you are sure "
            "this is a staging environment you own."
        )
    if not TOKEN:
        print(
            "WARNING: LOADTEST_TOKEN not set; authenticated endpoints will return 401 and count as failures."
        )


class ApiUser(HttpUser):
    wait_time = between(1, 3)  # think time between actions, like a real user

    def on_start(self):
        self.client.headers.update({"Authorization": f"Bearer {TOKEN}"})

    @task(5)
    def profile(self):
        self.client.get("/profile", name="GET /profile")

    @task(3)
    def assessments(self):
        self.client.get("/assessments", name="GET /assessments")

    @task(2)
    def resumes(self):
        self.client.get("/resume/list", name="GET /resume/list")

    @task(1)
    def health(self):
        self.client.get("/health", name="GET /health")

    @task(1)
    def unauthenticated_is_rejected(self):
        """Cheap check that auth stays enforced under load; 401/403 is the expected, correct answer."""
        with self.client.get(
            "/profile",
            headers={"Authorization": f"Bearer bad{random.randint(0, 9999)}"},
            name="GET /profile (bad token)",
            catch_response=True,
        ) as r:
            if r.status_code in (401, 403):
                r.success()
            else:
                r.failure(f"expected 401/403, got {r.status_code}")
