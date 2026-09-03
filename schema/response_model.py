from pydantic import BaseModel, Field


class PillarBreakdown(BaseModel):
    environmental: float = Field(
        ..., description="Score for the Environmental pillar",
        json_schema_extra={"example": 18.0},
    )
    social: float = Field(
        ..., description="Score for the Social pillar",
        json_schema_extra={"example": 10.0},
    )
    governance: float = Field(
        ..., description="Score for the Governance pillar",
        json_schema_extra={"example": 10.0},
    )


class PredictionResponse(BaseModel):
    predicted_category: str = Field(
        ...,
        description="Overall ESG readiness category",
        json_schema_extra={"example": "Medium"},
    )
    confidence: float = Field(
        ...,
        description="Model's confidence score for the predicted category (range: 0 to 1)",
        json_schema_extra={"example": 0.82},
    )
    pillar_breakdown: PillarBreakdown = Field(
        ...,
        description="Score breakdown across the three ESG pillars",
    )
    weakest_pillar: str = Field(
        ...,
        description="The ESG pillar with the lowest score, useful as a focus area",
        json_schema_extra={"example": "social"},
    )
