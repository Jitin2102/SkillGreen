import re

from config.skills_taxonomy import SKILL_TAXONOMY


def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for canonical_skill, synonyms in SKILL_TAXONOMY.items():
        for synonym in synonyms:
            if re.search(r"\b" + re.escape(synonym.lower()) + r"\b", text_lower):
                found.append(canonical_skill)
                break
    return found
