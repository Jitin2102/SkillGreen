from datetime import datetime

from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    years_experience: int | None = None
    current_industry: str | None = None
    education_level: str | None = None
    has_esg_certification: bool | None = None


class ProfileResponse(BaseModel):
    years_experience: int | None = None
    current_industry: str | None = None
    education_level: str | None = None
    has_esg_certification: bool | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class AssessmentResponse(BaseModel):
    id: int
    predicted_category: str
    confidence: str | None = None
    pillar_breakdown: dict | None = None
    weakest_pillar: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True
