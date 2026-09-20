import os

from sqlalchemy import create_engine  # type: ignore
from sqlalchemy.orm import declarative_base, sessionmaker  # type: ignore

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:devpass@localhost:5432/skillgreen"
)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-insecure-secret-change-me")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
