# ---- Valid categorical values ----
# Keep these in sync with the Literal types used in schema/user_input.py

VALID_INDUSTRIES = [
    "IT",
    "Manufacturing",
    "Finance",
    "Energy",
    "Construction",
    "Retail",
    "Other",
]

VALID_EDUCATION_LEVELS = [
    "High School",
    "Bachelors",
    "Masters",
    "PhD",
]

VALID_READINESS_CATEGORIES = [
    "Low",
    "Medium",
    "High",
]


# ---- Scoring weights ----
# Used both by schema/user_input.py (computed_field logic) and
# data/data_generator.py (to label synthetic rows consistently).

YEARS_EXPERIENCE_WEIGHT = 0.3
SKILLS_COUNT_WEIGHT = 2

ENVIRONMENTAL_PROJECT_BONUS = 10
SOCIAL_IMPACT_BONUS = 10
GOVERNANCE_EXPOSURE_BONUS = 10
ESG_CERTIFICATION_BONUS = 10


# ---- Category thresholds ----
# esg_readiness_score below LOW_THRESHOLD -> "Low"
# between LOW_THRESHOLD and MEDIUM_THRESHOLD -> "Medium"
# at or above MEDIUM_THRESHOLD -> "High"

LOW_THRESHOLD = 15
MEDIUM_THRESHOLD = 30
