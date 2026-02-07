"""
Calendar sync endpoints (Google Calendar, Outlook, etc.)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


@router.post("/sync-google")
def sync_google_calendar(resident_id: int, access_token: str, db: Session = Depends(get_db)):
    """Sync visitor approvals with Google Calendar"""
    pass


@router.post("/sync-outlook")
def sync_outlook_calendar(resident_id: int, access_token: str, db: Session = Depends(get_db)):
    """Sync visitor approvals with Outlook Calendar"""
    pass


@router.get("/{resident_id}/calendar-events")
def get_calendar_events(resident_id: int, db: Session = Depends(get_db)):
    """Get all calendar events (visitor approvals) for a resident"""
    pass
