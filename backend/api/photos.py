"""
Photo Management API Endpoints
Merged from backend_person3/routers/photos.py - now uses main backend DB + services
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
from models import Visitor
from services.photo_manager import upload_photo, get_photo_url, delete_photo
from utils.audit_logger import log_action

router = APIRouter(prefix="/api/photos", tags=["photos"])


@router.post("/upload")
def upload_visitor_photo(
    visitor_id: int,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a photo for a visitor.
    Stores the file and updates the visitor record with the photo URL.
    """
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    try:
        file_location = upload_photo(visitor_id, photo)
        # Update visitor record with photo URL
        visitor.photo_url = file_location
        log_action(db, "photo_uploaded", visitor_id=visitor_id,
                   details=f"Photo uploaded: {file_location}")
        db.commit()
        return {
            "message": "Photo uploaded successfully",
            "visitor_id": visitor_id,
            "file_location": file_location,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{visitor_id}")
def retrieve_visitor_photo(
    visitor_id: int,
    filename: str = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve the photo URL for a visitor.
    """
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    photo_url = get_photo_url(visitor_id, filename)
    if not photo_url:
        raise HTTPException(status_code=404, detail="Photo not found")

    return {"visitor_id": visitor_id, "photo_url": photo_url}


@router.delete("/{visitor_id}")
def delete_visitor_photo(
    visitor_id: int,
    filename: str = None,
    db: Session = Depends(get_db)
):
    """
    Delete a visitor's photo.
    """
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    success = delete_photo(visitor_id, filename)
    if success:
        visitor.photo_url = None
        log_action(db, "photo_deleted", visitor_id=visitor_id,
                   details="Photo deleted")
        db.commit()
        return {"message": "Photo deleted successfully", "visitor_id": visitor_id}
    else:
        raise HTTPException(status_code=404, detail="Photo not found")
