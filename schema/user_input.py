from typing import Annotated, Literal

from pydantic import BaseModel, Field, computed_field

from config.constants import (
    ENVIRONMENTAL_PROJECT_BONUS,
    ESG_CERTIFICATION_BONUS,
    GOVERNANCE_EXPOSURE_BONUS,
    LOW_THRESHOLD,
    MEDIUM_THRESHOLD,
    SKILLS_COUNT_WEIGHT,
    SOCIAL_IMPACT_BONUS,
    VALID_EDUCATION_LEVELS,
    VALID_INDUSTRIES,
    YEARS_EXPERIENCE_WEIGHT,
)

IndustryType = Literal[tuple(VALID_INDUSTRIES)]
EducationType = Literal[tuple(VALID_EDUCATION_LEVELS)]


class UserInput(BaseModel):
    years_experience: Annotated[
        int,
        Field(..., ge=0, le=50, description="Years of professional experience"),
    ]
    current_industry: Annotated[
        IndustryType,  # type: ignore
        Field(..., description="Current industry the user works in"),
    ]
    education_level: Annotated[
        EducationType,  # type: ignore
        Field(..., description="Highest education level completed"),
    ]
    has_esg_certification: Annotated[
        bool,
        Field(..., description="Holds a recognized ESG-related certification"),
    ]
    environmental_project_exposure: Annotated[
        bool,
        Field(..., description="Has worked on an environmental-focused initiative"),
    ]
    social_impact_exposure: Annotated[
        bool,
        Field(
            ...,
            description="Has worked on a social-impact initiative (DEI, labor, community)",
        ),
    ]
    governance_exposure: Annotated[
        bool,
        Field(
            ...,
            description="Has worked on governance-related work (compliance, audit, reporting)",
        ),
    ]
    relevant_skills_count: Annotated[
        int,
        Field(
            ..., ge=0, description="Number of relevant technical/analytical skills held"
        ),
    ]

    @computed_field
    @property
    def environmental_score(self) -> float:
        score = self.relevant_skills_count * SKILLS_COUNT_WEIGHT
        if self.environmental_project_exposure:
            score += ENVIRONMENTAL_PROJECT_BONUS
        return round(score, 2)

    @computed_field
    @property
    def social_score(self) -> float:
        score = SOCIAL_IMPACT_BONUS if self.social_impact_exposure else 0
        return round(score, 2)

    @computed_field
    @property
    def governance_score(self) -> float:
        score = GOVERNANCE_EXPOSURE_BONUS if self.governance_exposure else 0
        return round(score, 2)

    @computed_field
    @property
    def esg_readiness_score(self) -> float:
        base = self.environmental_score + self.social_score + self.governance_score
        base += self.years_experience * YEARS_EXPERIENCE_WEIGHT
        if self.has_esg_certification:
            base += ESG_CERTIFICATION_BONUS
        return round(base, 2)

    @computed_field
    @property
    def readiness_category(self) -> str:
        if self.esg_readiness_score < LOW_THRESHOLD:
            return "Low"
        elif self.esg_readiness_score < MEDIUM_THRESHOLD:
            return "Medium"
        return "High"
