"""
Automated tests for the SkillGreen API.
"""

from fastapi.testclient import TestClient

from app import app

client = TestClient(app)


def valid_payload(**overrides):
    payload = {
        "years_experience": 22,
        "current_industry": "Finance",
        "education_level": "High School",
        "has_esg_certification": True,
        "environmental_project_exposure": True,
        "social_impact_exposure": False,
        "governance_exposure": True,
        "relevant_skills_count": 6,
    }
    payload.update(overrides)
    return payload


def test_root_returns_welcome_message():
    response = client.get("/")
    assert response.status_code == 200
    assert "SkillGreen" in response.json()["message"]


def test_health_check_reports_model_loaded():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "OK"
    assert body["message"] == "Model loaded"
    assert "version" in body


def test_options_returns_valid_choices():
    response = client.get("/options")
    assert response.status_code == 200
    body = response.json()
    assert "IT" in body["industries"]
    assert "Bachelors" in body["education_levels"]


def test_predict_with_valid_payload_returns_full_shape():
    response = client.post("/predict", json=valid_payload())
    assert response.status_code == 200
    body = response.json()
    assert body["predicted_category"] in ["Low", "Medium", "High"]
    assert 0 <= body["confidence"] <= 1
    assert set(body["pillar_breakdown"].keys()) == {
        "environmental",
        "social",
        "governance",
    }
    assert body["weakest_pillar"] in body["pillar_breakdown"]


def test_predict_rejects_invalid_industry():
    response = client.post("/predict", json=valid_payload(current_industry="SpaceX"))
    assert response.status_code == 422


def test_predict_rejects_invalid_education_level():
    response = client.post(
        "/predict", json=valid_payload(education_level="Kindergarten")
    )
    assert response.status_code == 422


def test_predict_rejects_negative_years_experience():
    response = client.post("/predict", json=valid_payload(years_experience=-5))
    assert response.status_code == 422


def test_predict_rejects_years_experience_over_50():
    response = client.post("/predict", json=valid_payload(years_experience=100))
    assert response.status_code == 422


def test_predict_rejects_missing_required_field():
    payload = valid_payload()
    del payload["current_industry"]
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_predict_accepts_zero_years_and_zero_skills():
    response = client.post(
        "/predict", json=valid_payload(years_experience=0, relevant_skills_count=0)
    )
    assert response.status_code == 200


def test_predict_weakest_pillar_is_actually_the_minimum():
    """Sanity check: weakest_pillar should genuinely be the lowest-scoring pillar,
    not just any pillar. Uses a profile with no exposure to any ESG pillar work,
    so governance/social should be 0 and environmental should carry the only score."""
    response = client.post(
        "/predict",
        json=valid_payload(
            environmental_project_exposure=True,
            social_impact_exposure=False,
            governance_exposure=False,
            relevant_skills_count=5,
        ),
    )
    body = response.json()
    breakdown = body["pillar_breakdown"]
    assert body["weakest_pillar"] == min(breakdown, key=breakdown.get)
