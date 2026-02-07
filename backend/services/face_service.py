"""
Face Detection & Verification Service
Uses OpenCV Haar cascades for face detection and histogram comparison for verification.
Lightweight — no TensorFlow/DeepFace required.
"""
import cv2
import numpy as np
import os
import uuid
from pathlib import Path

PHOTOS_DIR = Path(__file__).parent.parent / "data" / "photos"
PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

# Load cascade classifier
FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


def detect_faces(image_bytes: bytes) -> dict:
    """
    Detect faces in an image.
    Returns: { detected: bool, count: int, faces: [...], image_path: str }
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        return {"detected": False, "count": 0, "error": "Invalid image"}

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = FACE_CASCADE.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
    )

    face_list = []
    for i, (x, y, w, h) in enumerate(faces):
        face_list.append({
            "index": i,
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h),
            "confidence": round(float(w * h) / (image.shape[0] * image.shape[1]) * 100, 1),
        })

    return {
        "detected": len(faces) > 0,
        "count": len(faces),
        "faces": face_list,
        "image_width": image.shape[1],
        "image_height": image.shape[0],
    }


def save_visitor_photo(image_bytes: bytes, visitor_id: int) -> str:
    """
    Save a visitor photo and return the filename.
    """
    filename = f"visitor_{visitor_id}_{uuid.uuid4().hex[:8]}.jpg"
    filepath = PHOTOS_DIR / filename
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    return filename


def crop_face(image_bytes: bytes) -> bytes | None:
    """
    Detect and crop the largest face from an image. Returns cropped face JPEG bytes.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return None

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = FACE_CASCADE.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
    )

    if len(faces) == 0:
        return None

    # Take the largest face
    faces_sorted = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    x, y, w, h = faces_sorted[0]

    # Add padding
    pad = int(max(w, h) * 0.2)
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(image.shape[1], x + w + pad)
    y2 = min(image.shape[0], y + h + pad)

    cropped = image[y1:y2, x1:x2]
    _, buffer = cv2.imencode(".jpg", cropped)
    return buffer.tobytes()


def verify_faces(image1_bytes: bytes, image2_bytes: bytes) -> dict:
    """
    Compare two face images using histogram correlation.
    Returns: { match: bool, confidence: float, message: str }
    """
    img1 = cv2.imdecode(np.frombuffer(image1_bytes, np.uint8), cv2.IMREAD_COLOR)
    img2 = cv2.imdecode(np.frombuffer(image2_bytes, np.uint8), cv2.IMREAD_COLOR)

    if img1 is None or img2 is None:
        return {"match": False, "confidence": 0, "message": "Invalid image(s)"}

    # Detect faces in both
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    faces1 = FACE_CASCADE.detectMultiScale(gray1, 1.1, 5, minSize=(60, 60))
    faces2 = FACE_CASCADE.detectMultiScale(gray2, 1.1, 5, minSize=(60, 60))

    if len(faces1) == 0:
        return {"match": False, "confidence": 0, "message": "No face detected in first image"}
    if len(faces2) == 0:
        return {"match": False, "confidence": 0, "message": "No face detected in second image"}

    # Crop the largest face from each
    x1, y1, w1, h1 = sorted(faces1, key=lambda f: f[2] * f[3], reverse=True)[0]
    x2, y2, w2, h2 = sorted(faces2, key=lambda f: f[2] * f[3], reverse=True)[0]

    face1 = img1[y1:y1 + h1, x1:x1 + w1]
    face2 = img2[y2:y2 + h2, x2:x2 + w2]

    # Resize both faces to the same size
    target_size = (128, 128)
    face1 = cv2.resize(face1, target_size)
    face2 = cv2.resize(face2, target_size)

    # Compare using histogram correlation
    hist1 = cv2.calcHist([face1], [0, 1, 2], None, [32, 32, 32], [0, 256, 0, 256, 0, 256])
    hist2 = cv2.calcHist([face2], [0, 1, 2], None, [32, 32, 32], [0, 256, 0, 256, 0, 256])

    cv2.normalize(hist1, hist1)
    cv2.normalize(hist2, hist2)

    correlation = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
    confidence = round(max(0, correlation) * 100, 1)

    # Threshold for match
    match = confidence > 55

    if match:
        message = f"Faces match with {confidence}% confidence"
    else:
        message = f"Faces do not match ({confidence}% confidence)"

    return {
        "match": match,
        "confidence": confidence,
        "message": message,
    }


def draw_face_boxes(image_bytes: bytes) -> bytes | None:
    """
    Draw bounding boxes on detected faces and return the annotated image bytes.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return None

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = FACE_CASCADE.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))

    for (x, y, w, h) in faces:
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 200, 0), 2)
        cv2.putText(image, "Face", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 0), 2)

    _, buffer = cv2.imencode(".jpg", image)
    return buffer.tobytes()
