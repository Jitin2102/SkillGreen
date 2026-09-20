import logging

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user, get_current_user_optional
from auth.routes import router as auth_router
from config.constants import VALID_EDUCATION_LEVELS, VALID_INDUSTRIES
from db.database import get_db
from db.models import Assessment, User
from model.predict import MODEL_VERSION, model, predict_output
from routes.profile import router as profile_router
from schema.response_model import PredictionResponse
from schema.user_input import UserInput

logger = logging.getLogger("skillgreen")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="SkillGreen",
    description="Predicts ESG (Environmental, Social, Governance) career readiness "
    "from a professional's background.",
    version="1.2.0",
)
app.include_router(auth_router)
app.include_router(profile_router)

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


@app.get("/")
def root():
    return {"message": "Welcome to SkillGreen — ESG Readiness Prediction API"}


@app.get("/health")
def health_check():
    status = "OK" if model else "Error"
    return {
        "status": status,
        "message": "Model loaded" if model else "Model not available",
        "version": MODEL_VERSION,
    }


@app.get("/options")
def get_valid_options():
    return {
        "industries": VALID_INDUSTRIES,
        "education_levels": VALID_EDUCATION_LEVELS,
    }


@app.get("/me")
def read_me(current_user: User = Depends(get_current_user)):  # noqa: B008
    return {"email": current_user.email, "id": current_user.id}


@app.post("/predict", response_model=PredictionResponse)
def predict_readiness(
    data: UserInput,
    current_user: User | None = Depends(get_current_user_optional),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
):
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

        if current_user is not None:
            assessment = Assessment(
                user_id=current_user.id,
                predicted_category=prediction["category"],
                confidence=prediction["confidence"],
                pillar_breakdown=pillar_breakdown,
                weakest_pillar=weakest_pillar,
            )
            db.add(assessment)
            db.commit()

        return JSONResponse(
            status_code=200,
            content={
                "predicted_category": prediction["category"],
                "confidence": prediction["confidence"],
                "pillar_breakdown": pillar_breakdown,
                "weakest_pillar": weakest_pillar,
            },
        )
    except Exception:
        logger.exception("Prediction failed for input: %s", user_input)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Prediction failed. Please try again or contact support."
            },
        )
