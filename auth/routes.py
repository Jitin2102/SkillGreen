from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.security import (
    create_access_token,
    generate_otp_code,
    hash_password,
    otp_expiry,
    send_otp_email,
    verify_password,
)
from db.database import get_db
from db.models import OtpCode, User
from schema.auth import OtpRequest, OtpVerify, Token, UserCreate, UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):  # noqa: B008
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):  # noqa: B008
    user = db.query(User).filter(User.email == payload.email).first()
    if (
        not user
        or not user.hashed_password
        or not verify_password(payload.password, user.hashed_password)
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})
    return Token(access_token=token)


@router.post("/otp/request")
def request_otp(payload: OtpRequest, db: Session = Depends(get_db)):  # noqa: B008
    code = generate_otp_code()
    otp = OtpCode(
        email=payload.email,
        code_hash=hash_password(code),
        expires_at=otp_expiry(),
    )
    db.add(otp)
    db.commit()

    send_otp_email(payload.email, code)

    # Deliberately vague response: never confirms whether this email has
    # an account, to avoid leaking which emails are registered.
    return {"message": "If that email is valid, a code has been sent."}


@router.post("/otp/verify", response_model=Token)
def verify_otp(payload: OtpVerify, db: Session = Depends(get_db)):  # noqa: B008
    otp = (
        db.query(OtpCode)
        .filter(OtpCode.email == payload.email, OtpCode.used == False)  # noqa: E712
        .order_by(OtpCode.created_at.desc())
        .first()
    )

    if (
        not otp
        or otp.expires_at < datetime.now(timezone.utc)
        or not verify_password(payload.code, otp.code_hash)
    ):
        raise HTTPException(status_code=401, detail="Invalid or expired code.")

    otp.used = True
    db.commit()

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # First successful OTP for this email — create the account.
        # hashed_password stays NULL: this account has no password set
        # unless the person sets one later through a separate flow.
        user = User(email=payload.email, hashed_password=None)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email})
    return Token(access_token=token)
