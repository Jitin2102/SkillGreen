import uuid

import pytest
from fastapi.testclient import TestClient

from app import app
from db.database import SessionLocal
from db.models import User

client = TestClient(app)


@pytest.fixture
def test_email():
    """A fresh, unique email for each test so runs don't collide."""
    email = f"test-{uuid.uuid4().hex[:10]}@example.com"
    yield email
    # cleanup: remove the user this test created, if it exists
    db = SessionLocal()
    try:
        db.query(User).filter(User.email == email).delete()
        db.commit()
    finally:
        db.close()


def test_register_success(test_email):
    response = client.post(
        "/auth/register",
        json={"email": test_email, "password": "testpass123"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_register_duplicate_email_fails(test_email):
    client.post(
        "/auth/register",
        json={"email": test_email, "password": "testpass123"},
    )
    response = client.post(
        "/auth/register",
        json={"email": test_email, "password": "differentpass"},
    )
    assert response.status_code == 400


def test_login_success(test_email):
    client.post(
        "/auth/register",
        json={"email": test_email, "password": "testpass123"},
    )
    response = client.post(
        "/auth/login",
        json={"email": test_email, "password": "testpass123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password_fails(test_email):
    client.post(
        "/auth/register",
        json={"email": test_email, "password": "testpass123"},
    )
    response = client.post(
        "/auth/login",
        json={"email": test_email, "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_nonexistent_user_fails():
    response = client.post(
        "/auth/login",
        json={"email": "does-not-exist@example.com", "password": "whatever"},
    )
    assert response.status_code == 401


def test_protected_route_requires_token():
    response = client.get("/me")
    assert response.status_code in (401, 403)


def test_protected_route_with_valid_token(test_email):
    register_response = client.post(
        "/auth/register",
        json={"email": test_email, "password": "testpass123"},
    )
    token = register_response.json()["access_token"]

    response = client.get(
        "/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == test_email


def test_protected_route_with_invalid_token():
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert response.status_code == 401


def test_register_rejects_password_over_72_bytes(test_email):
    response = client.post(
        "/auth/register",
        json={"email": test_email, "password": "a" * 73},
    )
    assert response.status_code == 422


def test_legacy_passlib_hash_still_verifies():
    from auth.security import verify_password

    legacy_hash = "$2b$12$JD6bZ6ZUZ7o2fR2vDEk58e04rbzpi1yjd57qQl3HC2YkLBH8ayLCa"
    assert verify_password("testpass123", legacy_hash)
    assert not verify_password("wrongpass", legacy_hash)
