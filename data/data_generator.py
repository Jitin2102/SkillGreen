import numpy as np
import pandas as pd

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

RANDOM_SEED = 42
N_ROWS = 8000


def generate_raw_profiles(n_rows: int, rng: np.random.Generator) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "years_experience": rng.integers(0, 51, size=n_rows),
            "current_industry": rng.choice(VALID_INDUSTRIES, size=n_rows),
            "education_level": rng.choice(
                VALID_EDUCATION_LEVELS,
                size=n_rows,
                p=[0.15, 0.55, 0.25, 0.05],  # roughly realistic skew toward Bachelors
            ),
            "has_esg_certification": rng.choice(
                [True, False], size=n_rows, p=[0.2, 0.8]
            ),
            "environmental_project_exposure": rng.choice(
                [True, False], size=n_rows, p=[0.3, 0.7]
            ),
            "social_impact_exposure": rng.choice(
                [True, False], size=n_rows, p=[0.3, 0.7]
            ),
            "governance_exposure": rng.choice(
                [True, False], size=n_rows, p=[0.25, 0.75]
            ),
            "relevant_skills_count": rng.integers(0, 11, size=n_rows),
        }
    )


def apply_scoring_formula(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["environmental_score"] = (
        df["relevant_skills_count"] * SKILLS_COUNT_WEIGHT
        + df["environmental_project_exposure"] * ENVIRONMENTAL_PROJECT_BONUS
    )

    df["social_score"] = df["social_impact_exposure"] * SOCIAL_IMPACT_BONUS

    df["governance_score"] = df["governance_exposure"] * GOVERNANCE_EXPOSURE_BONUS

    df["esg_readiness_score"] = (
        df["environmental_score"]
        + df["social_score"]
        + df["governance_score"]
        + df["years_experience"] * YEARS_EXPERIENCE_WEIGHT
        + df["has_esg_certification"] * ESG_CERTIFICATION_BONUS
    ).round(2)

    df["readiness_category"] = pd.cut(
        df["esg_readiness_score"],
        bins=[-np.inf, LOW_THRESHOLD, MEDIUM_THRESHOLD, np.inf],
        labels=["Low", "Medium", "High"],
    )

    return df


def add_label_noise(
    df: pd.DataFrame, flip_fraction: float, rng: np.random.Generator
) -> pd.DataFrame:

    df = df.copy()
    n_flip = int(len(df) * flip_fraction)
    flip_idx = rng.choice(df.index, size=n_flip, replace=False)
    categories = ["Low", "Medium", "High"]
    df.loc[flip_idx, "readiness_category"] = [
        rng.choice([c for c in categories if c != current])
        for current in df.loc[flip_idx, "readiness_category"]
    ]
    return df


def generate_dataset(n_rows: int = N_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    df = generate_raw_profiles(n_rows, rng)
    df = apply_scoring_formula(df)
    df = add_label_noise(df, flip_fraction=0.05, rng=rng)
    return df


if __name__ == "__main__":
    dataset = generate_dataset()
    dataset.to_csv("data/skillgreen.csv", index=False)
    print(f"Generated {len(dataset)} rows -> data/skillgreen.csv")
    print(dataset["readiness_category"].value_counts())
