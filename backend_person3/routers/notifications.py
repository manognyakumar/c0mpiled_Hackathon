from fastapi import APIRouter, HTTPException
from services.notification_service import send_notification

router = APIRouter()

# Endpoint to send a notification
@router.post("/")
def send_guard_notification(to: str, message: str):
    try:
        success = send_notification(to, message)
        if success:
            return {"message": "Notification sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send notification")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))