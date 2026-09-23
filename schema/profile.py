from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfileUpdate(BaseModel):
    years_experience: int | None = None
    current_industry: str | None = None
    education_level: str | None = None
    has_esg_certification: bool | None = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    years_experience: int | None = None
    current_industry: str | None = None
    education_level: str | None = None
    has_esg_certification: bool = False
    updated_at: datetime | None = None


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    predicted_category: str
    confidence: str | None = None
    pillar_breakdown: dict | None = None
    weakest_pillar: str | None = None
    created_at: datetime | None = None
