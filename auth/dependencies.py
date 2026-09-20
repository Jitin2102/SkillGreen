from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt  # type: ignore
from sqlalchemy.orm import Session

from auth.security import ALGORITHM
from db.database import SECRET_KEY, get_db
from db.models import User

bearer_scheme = HTTPBearer(scheme_name="BearerAuth")
optional_bearer_scheme = HTTPBearer(auto_error=False, scheme_name="BearerAuth")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> User:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer_scheme),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> User | None:
    """Like get_current_user, but returns None instead of raising 401
    when no token (or an invalid one) is provided. Used on routes that
    should work for both logged-in and anonymous callers."""
    if credentials is None:
        return None
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        email = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None

    return db.query(User).filter(User.email == email).first()
