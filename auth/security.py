import os
import secrets
import smtplib
from datetime import UTC, datetime, timedelta
from email.message import EmailMessage

import bcrypt
import jwt

from config.settings import SECRET_KEY

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
OTP_EXPIRE_MINUTES = 10
BCRYPT_MAX_BYTES = 72

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)


def hash_password(password: str) -> str:
    raw = password.encode("utf-8")
    if len(raw) > BCRYPT_MAX_BYTES:
        raise ValueError("Password must be at most 72 bytes")
    return bcrypt.hashpw(raw, bcrypt.gensalt()).decode("ascii")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    raw = plain_password.encode("utf-8")[:BCRYPT_MAX_BYTES]
    try:
        return bcrypt.checkpw(raw, hashed_password.encode("ascii"))
    except ValueError:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def generate_otp_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def otp_expiry() -> datetime:
    return datetime.now(UTC) + timedelta(minutes=OTP_EXPIRE_MINUTES)


def send_otp_email(to_email: str, code: str) -> None:
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
        print(f"[DEV] OTP for {to_email}: {code} (expires in {OTP_EXPIRE_MINUTES} min)")
        return

    msg = EmailMessage()
    msg["Subject"] = "Your SkillGreen sign-in code"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg.set_content(
        f"Your SkillGreen sign-in code is: {code}\n\n"
        f"This code expires in {OTP_EXPIRE_MINUTES} minutes. "
        "If you didn't request this, you can safely ignore this email."
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
