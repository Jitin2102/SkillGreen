from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config.constants import VALID_EDUCATION_LEVELS, VALID_INDUSTRIES
from model.predict import MODEL_VERSION, model, predict_output
from schema.response_model import PredictionResponse
from schema.user_input import UserInput

app = FastAPI(
    title="SkillGreen",
    description="Predicts ESG (Environmental, Social, Governance) career readiness "
    "from a professional's background.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://skill-green.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


### human readable
@app.get("/")
def root():
    return {"message": "Welcome to SkillGreen — ESG Readiness Prediction API"}


### machine readable
@app.get("/health")
def health_check():
    status = "OK" if model else "Error"
    return {
        "status": status,
        "message": "Model loaded" if model else "Model not available",
        "version": MODEL_VERSION,
    }


### reference data, so a frontend or consumer can build valid dropdowns
@app.get("/options")
def get_valid_options():
    return {
        "industries": VALID_INDUSTRIES,
        "education_levels": VALID_EDUCATION_LEVELS,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_readiness(data: UserInput):

    user_input = {
        "years_experience": data.years_experience,
        "relevant_skills_count": data.relevant_skills_count,
        "environmental_score": data.environmental_score,
        "social_score": data.social_score,
        "governance_score": data.governance_score,
        "esg_readiness_score": data.esg_readiness_score,
        "current_industry": data.current_industry,
        "education_level": data.education_level,
        "has_esg_certification": data.has_esg_certification,
        "environmental_project_exposure": data.environmental_project_exposure,
        "social_impact_exposure": data.social_impact_exposure,
        "governance_exposure": data.governance_exposure,
    }

    try:
        prediction = predict_output(user_input)

        pillar_breakdown = {
            "environmental": data.environmental_score,
            "social": data.social_score,
            "governance": data.governance_score,
        }
        weakest_pillar = min(pillar_breakdown, key=pillar_breakdown.get)

        return JSONResponse(
            status_code=200,
            content={
                "predicted_category": prediction["category"],
                "confidence": prediction["confidence"],
                "pillar_breakdown": pillar_breakdown,
                "weakest_pillar": weakest_pillar,
            },
        )
    except Exception as e:  # noqa: BLE001
        return JSONResponse(
            status_code=500,
            content={"error": "Prediction failed", "details": str(e)},
        )
