from config.skill_requirements import TARGET_SKILLS_BY_CATEGORY


def compute_skill_gap(user_skills: list[str], target_category: str) -> dict:
    target = set(TARGET_SKILLS_BY_CATEGORY.get(target_category, []))
    have = set(user_skills or [])

    return {
        "target_category": target_category,
        "matched": sorted(have & target),
        "missing": sorted(target - have),
        "extra": sorted(have - target),
    }


def next_category_up(current_category: str) -> str:

    order = ["Low", "Medium", "High"]
    try:
        idx = order.index(current_category)
    except ValueError:
        return current_category
    return order[min(idx + 1, len(order) - 1)]
