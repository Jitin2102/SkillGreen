import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from db.database import get_db
from db.models import Assessment, Resume, User
from resume.infer_fields import infer_predict_fields_from_skills
from resume.parser import extract_text
from resume.skill_gap import compute_skill_gap, next_category_up
from resume.skills import extract_skills

router = APIRouter(prefix="/resume", tags=["resume"])

UPLOAD_DIR = "uploads/resumes"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE_MB = 5

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),  # noqa: B008
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, detail="Only PDF and DOCX files are supported."
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400, detail=f"File too large (max {MAX_FILE_SIZE_MB}MB)."
        )

    stored_name = f"{current_user.id}_{uuid.uuid4().hex[:10]}{ext}"
    storage_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(storage_path, "wb") as f:  # noqa: ASYNC230
        f.write(contents)

    resume = Resume(
        user_id=current_user.id,
        original_filename=file.filename,
        storage_path=storage_path,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    try:
        resume.raw_text = extract_text(storage_path)
        resume.extracted_skills = extract_skills(resume.raw_text)
        db.commit()
    except Exception:  # noqa: S110
        # If parsing fails, we still want to keep the resume in the database
        # and allow for retries later.
        pass

    return {
        "id": resume.id,
        "filename": resume.original_filename,
        "status": "uploaded",
        "parsed": resume.raw_text is not None,
        "extracted_skills": resume.extracted_skills,
    }


@router.get("/list")
def list_resumes(
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "filename": r.original_filename,
            "uploaded_at": r.uploaded_at,
            "has_extracted_skills": r.extracted_skills is not None,
        }
        for r in resumes
    ]


@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    return {
        "id": resume.id,
        "filename": resume.original_filename,
        "uploaded_at": resume.uploaded_at,
        "raw_text": resume.raw_text,
        "extracted_skills": resume.extracted_skills,
    }


@router.get("/{resume_id}/skill-gap")
def get_skill_gap(
    resume_id: int,
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    if resume.extracted_skills is None:
        raise HTTPException(
            status_code=400,
            detail="This resume hasn't been parsed for skills yet.",
        )

    latest_assessment = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
        .first()
    )

    if latest_assessment:
        current_category = latest_assessment.predicted_category
        target_category = next_category_up(current_category)
    else:
        current_category = None
        target_category = "Medium"

    gap = compute_skill_gap(resume.extracted_skills, target_category)
    gap["current_category"] = current_category
    return gap


@router.get("/{resume_id}/inferred-fields")
def get_inferred_fields(
    resume_id: int,
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    if resume.extracted_skills is None:
        raise HTTPException(
            status_code=400,
            detail="This resume hasn't been parsed for skills yet.",
        )

    return infer_predict_fields_from_skills(resume.extracted_skills)
