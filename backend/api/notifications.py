"""
Notification API Endpoints
Merged from backend_person3/routers/notifications.py - now uses main backend services
"""
from fastapi import APIRouter, HTTPException

from services.notification_service import send_notification

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.post("/")
def send_guard_notification(to: str, message: str):
    """
    Send a notification to a guard or resident.
    """
    try:
        success = send_notification(to, message)
        if success:
            return {"message": "Notification sent successfully", "to": to}
        else:
            raise HTTPException(status_code=500, detail="Failed to send notification")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
