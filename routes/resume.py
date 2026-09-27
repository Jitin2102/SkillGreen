import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from db.database import get_db
from db.models import Resume, User

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

    return {"id": resume.id, "filename": resume.original_filename, "status": "uploaded"}


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
