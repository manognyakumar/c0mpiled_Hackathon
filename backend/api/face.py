"""
Face Detection & Verification API Endpoints
POST /api/face/detect     — Detect faces in an uploaded image
POST /api/face/verify     — Compare two face images
POST /api/face/capture    — Capture & store visitor photo
"""
import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from services.face_service import detect_faces, verify_faces, save_visitor_photo, crop_face, draw_face_boxes

router = APIRouter(prefix="/api/face", tags=["face"])


@router.post("/detect")
async def detect(photo: UploadFile = File(...)):
    """
    Detect faces in an uploaded image.
    Returns face count, bounding boxes, and annotated image.
    """
    image_bytes = await photo.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image")

    result = detect_faces(image_bytes)

    # Also return annotated image as base64 for display
    annotated_bytes = draw_face_boxes(image_bytes)
    annotated_b64 = None
    if annotated_bytes:
        annotated_b64 = base64.b64encode(annotated_bytes).decode("utf-8")

    return {
        **result,
        "annotated_image": annotated_b64,
    }


@router.post("/verify")
async def verify(
    photo1: UploadFile = File(...),
    photo2: UploadFile = File(...)
):
    """
    Verify if two photos contain the same person.
    Photo1 = live capture, Photo2 = stored/ID photo.
    """
    bytes1 = await photo1.read()
    bytes2 = await photo2.read()

    if not bytes1 or not bytes2:
        raise HTTPException(status_code=400, detail="Both images are required")

    result = verify_faces(bytes1, bytes2)
    return result


@router.post("/capture")
async def capture(
    photo: UploadFile = File(...),
    visitor_id: int = Form(...)
):
    """
    Capture and store a visitor photo. Detects face first.
    """
    image_bytes = await photo.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image")

    detection = detect_faces(image_bytes)
    if not detection["detected"]:
        raise HTTPException(status_code=400, detail="No face detected in photo")

    # Crop face
    cropped = crop_face(image_bytes)

    # Save the original photo
    filename = save_visitor_photo(image_bytes, visitor_id)

    return {
        "success": True,
        "filename": filename,
        "visitor_id": visitor_id,
        "faces_detected": detection["count"],
        "face_data": detection["faces"][0] if detection["faces"] else None,
    }
