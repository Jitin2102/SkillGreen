from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from db.database import get_db
from db.models import Assessment, Profile, User
from schema.profile import AssessmentResponse, ProfileResponse, ProfileUpdate

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        # no profile saved yet — return an empty/default one rather than a 404,
        # since "no profile yet" is a normal state for a new user
        return ProfileResponse()
    return profile


@router.post("/profile", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/assessments", response_model=list[AssessmentResponse])
def get_assessments(
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
):
    return (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )
