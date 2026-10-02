ENVIRONMENTAL_SKILLS = {
    "carbon accounting",
    "renewable energy",
    "environmental impact assessment",
    "supply chain sustainability",
}

SOCIAL_SKILLS = {
    "diversity & inclusion",
    "community engagement",
}

GOVERNANCE_SKILLS = {
    "corporate governance",
    "regulatory compliance",
    "risk management",
}


def infer_predict_fields_from_skills(skills: list[str]) -> dict:
    skill_set = set(skills or [])

    return {
        "environmental_project_exposure": bool(skill_set & ENVIRONMENTAL_SKILLS),
        "social_impact_exposure": bool(skill_set & SOCIAL_SKILLS),
        "governance_exposure": bool(skill_set & GOVERNANCE_SKILLS),
        "has_esg_certification": bool(
            skill_set & (ENVIRONMENTAL_SKILLS | SOCIAL_SKILLS | GOVERNANCE_SKILLS)
        ),
        "relevant_skills_count": min(len(skill_set), 10),
    }
