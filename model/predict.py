import os

import joblib
import pandas as pd

MODEL_VERSION = "1.1.0"

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

FEATURE_COLUMNS = [
    "years_experience",
    "relevant_skills_count",
    "environmental_score",
    "social_score",
    "governance_score",
    "esg_readiness_score",
    "current_industry",
    "education_level",
    "has_esg_certification",
    "environmental_project_exposure",
    "social_impact_exposure",
    "governance_exposure",
]

BOOLEAN_COLUMNS = [
    "has_esg_certification",
    "environmental_project_exposure",
    "social_impact_exposure",
    "governance_exposure",
]

try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    model = None


def predict_output(user_input: dict) -> dict:
    if model is None:
        raise RuntimeError(
            "Model is not loaded. Check that model.pkl exists in model/."
        )

    row = {col: user_input[col] for col in FEATURE_COLUMNS}

    for col in BOOLEAN_COLUMNS:
        row[col] = int(row[col])

    input_df = pd.DataFrame([row], columns=FEATURE_COLUMNS)

    predicted_class = model.predict(input_df)[0]

    # class_probabilities lets us report a real confidence score instead of just the label
    proba = model.predict_proba(input_df)[0]
    class_labels = model.classes_
    confidence = float(max(proba))

    return {
        "category": str(predicted_class),
        "confidence": round(confidence, 4),
        "class_probabilities": {
            str(label): round(float(p), 4) for label, p in zip(class_labels, proba)
        },
    }
