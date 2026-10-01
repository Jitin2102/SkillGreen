from config.constants import (
    ENVIRONMENTAL_PROJECT_BONUS,
    ESG_CERTIFICATION_BONUS,
    GOVERNANCE_EXPOSURE_BONUS,
    SKILLS_COUNT_WEIGHT,
    SOCIAL_IMPACT_BONUS,
    YEARS_EXPERIENCE_WEIGHT,
)


def explain_score(user_input: dict) -> dict:
    contributions = {
        "years_experience": user_input.get("years_experience", 0)
        * YEARS_EXPERIENCE_WEIGHT,
        "relevant_skills_count": user_input.get("relevant_skills_count", 0)
        * SKILLS_COUNT_WEIGHT,
        "environmental_project_exposure": (
            ENVIRONMENTAL_PROJECT_BONUS
            if user_input.get("environmental_project_exposure")
            else 0
        ),
        "social_impact_exposure": (
            SOCIAL_IMPACT_BONUS if user_input.get("social_impact_exposure") else 0
        ),
        "governance_exposure": (
            GOVERNANCE_EXPOSURE_BONUS if user_input.get("governance_exposure") else 0
        ),
        "has_esg_certification": (
            ESG_CERTIFICATION_BONUS if user_input.get("has_esg_certification") else 0
        ),
    }

    total = sum(contributions.values())
    sorted_contributions = dict(
        sorted(contributions.items(), key=lambda kv: kv[1], reverse=True)
    )

    return {
        "contributions": sorted_contributions,
        "total_from_these_factors": total,
        "explains": "scoring_formula",  # not "trained_model" — see docstring
    }
