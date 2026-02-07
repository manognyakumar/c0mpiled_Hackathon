"""
Calendar Sync API Endpoints
POST /api/calendar/sync - Sync calendar events to auto-create approvals
"""
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Visitor, Approval, Resident
from schemas import CalendarEvent, CalendarSyncRequest, CalendarSyncResponse
from services.time_validator import parse_time_string, calculate_time_window
from utils.audit_logger import log_action
from core import settings

DEFAULT_APPROVAL_DURATION = settings.default_approval_duration

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


# Keywords to identify visitor-related events
VISITOR_KEYWORDS = [
    # Delivery
    'delivery', 'package', 'parcel', 'noon', 'talabat', 'amazon', 'carrefour',
    # Service
    'technician', 'repair', 'plumber', 'electrician', 'ac', 'maintenance', 
    'cleaning', 'cleaner', 'pest control',
    # Guests
    'visitor', 'guest', 'friend', 'family', 'visit',
    # Work
    'contractor', 'worker', 'installation', 'install',
    # Arabic keywords
    'توصيل', 'فني', 'صيانة', 'زائر', 'ضيف'
]


def is_visitor_event(title: str) -> bool:
    """Check if calendar event title suggests a visitor"""
    title_lower = title.lower()
    return any(keyword in title_lower for keyword in VISITOR_KEYWORDS)


def extract_visitor_from_event(event: CalendarEvent) -> dict:
    """Extract visitor info from calendar event"""
    title = event.title
    
    # Determine purpose from keywords
    title_lower = title.lower()
    purpose = "Visit"  # default
    
    if any(k in title_lower for k in ['delivery', 'package', 'noon', 'amazon', 'talabat']):
        purpose = "Delivery"
    elif any(k in title_lower for k in ['technician', 'repair', 'plumber', 'electrician', 'ac']):
        purpose = "Service/Repair"
    elif any(k in title_lower for k in ['cleaning', 'cleaner']):
        purpose = "Cleaning"
    elif any(k in title_lower for k in ['contractor', 'worker', 'install']):
        purpose = "Work/Installation"
    elif any(k in title_lower for k in ['friend', 'family', 'guest']):
        purpose = "Guest Visit"
    
    return {
        "name": title,  # Use event title as visitor name
        "purpose": purpose
    }


@router.post("/sync", response_model=CalendarSyncResponse)
def sync_calendar(
    request: CalendarSyncRequest,
    db: Session = Depends(get_db)
):
    """
    Sync calendar events and auto-create approvals for visitor-related events.
    
    For demo: Accepts a list of events directly.
    In production: Would integrate with Google Calendar API or Outlook.
    """
    resident = db.query(Resident).filter(Resident.id == request.resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    events_processed = 0
    approvals_created = 0
    
    for event in request.events:
        events_processed += 1
        
        # Check if this looks like a visitor event
        if not is_visitor_event(event.title):
            continue
        
        # Extract visitor info
        visitor_info = extract_visitor_from_event(event)
        
        # Create visitor record
        visitor = Visitor(
            name=visitor_info["name"],
            purpose=visitor_info["purpose"]
        )
        db.add(visitor)
        db.flush()
        
        # Parse event time
        scheduled_time = parse_time_string(event.time)
        if scheduled_time is None:
            scheduled_time = datetime.utcnow() + timedelta(hours=1)
        
        # Calculate time window (15 min before, 30 min after)
        valid_from = scheduled_time - timedelta(minutes=15)
        valid_until = scheduled_time + timedelta(minutes=30)
        
        # Create auto-approved approval
        approval = Approval(
            resident_id=request.resident_id,
            visitor_id=visitor.id,
            status="approved",
            valid_from=valid_from,
            valid_until=valid_until,
            approval_method="calendar",
            approved_at=datetime.utcnow()
        )
        db.add(approval)
        
        # Log the action
        log_action(
            db, "calendar_sync",
            resident_id=request.resident_id,
            visitor_id=visitor.id,
            details=f"Auto-approved from calendar: {event.title} at {event.time}"
        )
        
        approvals_created += 1
    
    db.commit()
    
    return CalendarSyncResponse(
        success=True,
        events_processed=events_processed,
        approvals_created=approvals_created
    )


@router.post("/sync-demo")
def sync_demo_events(
    resident_id: int,
    db: Session = Depends(get_db)
):
    """
    Demo endpoint: Creates sample calendar events for testing.
    Simulates what would happen when syncing from Google Calendar.
    """
    resident = db.query(Resident).filter(Resident.id == resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    # Sample events that would come from a calendar
    demo_events = [
        CalendarEvent(title="Noon Delivery", time="14:00"),
        CalendarEvent(title="AC Technician Visit", time="16:00"),
        CalendarEvent(title="Friend Ahmed visiting", time="18:30"),
    ]
    
    request = CalendarSyncRequest(
        resident_id=resident_id,
        events=demo_events
    )
    
    return sync_calendar(request, db)


@router.get("/events/{resident_id}")
def get_synced_events(
    resident_id: int,
    db: Session = Depends(get_db)
):
    """Get all calendar-synced approvals for a resident"""
    approvals = db.query(Approval).filter(
        Approval.resident_id == resident_id,
        Approval.approval_method == "calendar"
    ).order_by(Approval.created_at.desc()).all()
    
    results = []
    for approval in approvals:
        visitor = db.query(Visitor).filter(Visitor.id == approval.visitor_id).first()
        if visitor:
            results.append({
                "approval_id": approval.id,
                "event_title": visitor.name,
                "purpose": visitor.purpose,
                "status": approval.status,
                "valid_from": approval.valid_from,
                "valid_until": approval.valid_until,
                "created_at": approval.created_at
            })
    
    return {"events": results, "count": len(results)}
