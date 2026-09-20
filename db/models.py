from sqlalchemy import (  # type: ignore
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.sql import func  # type: ignore

from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    years_experience = Column(Integer, nullable=True)
    current_industry = Column(String, nullable=True)
    education_level = Column(String, nullable=True)
    has_esg_certification = Column(Boolean, default=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    predicted_category = Column(String, nullable=False)
    confidence = Column(String, nullable=True)
    pillar_breakdown = Column(JSON, nullable=True)
    weakest_pillar = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
