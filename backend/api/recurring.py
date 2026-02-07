"""
Recurring Visitor Management API Endpoints
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import RecurringVisitor, Visitor, Approval, Resident
from schemas import RecurringVisitorCreate, RecurringVisitorResponse
from services.time_validator import parse_time_string
from utils.audit_logger import log_action

router = APIRouter(prefix="/api/recurring-visitors", tags=["recurring"])


def parse_schedule(schedule: str) -> list:
    """
    Parse schedule string into list of weekdays.
    Examples:
        "every_monday" -> [0]
        "every_tuesday_thursday" -> [1, 3]
        "daily" -> [0, 1, 2, 3, 4, 5, 6]
        "weekdays" -> [0, 1, 2, 3, 4]
    """
    schedule_lower = schedule.lower().replace("-", "_")
    
    day_map = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6
    }
    
    if schedule_lower == "daily":
        return list(range(7))
    elif schedule_lower == "weekdays":
        return list(range(5))
    elif schedule_lower == "weekends":
        return [5, 6]
    
    days = []
    for day_name, day_num in day_map.items():
        if day_name in schedule_lower:
            days.append(day_num)
    
    return days if days else [0]  # Default to Monday if unparseable


def parse_time_window(time_window: str) -> tuple:
    """
    Parse time window string into (start_time, end_time).
    Example: "09:00-12:00" -> ("09:00", "12:00")
    """
    if "-" in time_window:
        parts = time_window.split("-")
        return parts[0].strip(), parts[1].strip()
    return time_window.strip(), "23:59"


@router.post("/", response_model=RecurringVisitorResponse)
def create_recurring_visitor(
    request: RecurringVisitorCreate,
    db: Session = Depends(get_db)
):
    """
    Create a recurring visitor schedule.
    
    Schedule examples:
        - "every_monday"
        - "every_tuesday_thursday"
        - "daily"
        - "weekdays"
    
    Time window example: "09:00-12:00"
    """
    resident = db.query(Resident).filter(Resident.id == request.resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    recurring = RecurringVisitor(
        resident_id=request.resident_id,
        name=request.name,
        schedule=request.schedule,
        time_window=request.time_window,
        photo_url=request.photo_url,
        is_active=True
    )
    db.add(recurring)
    
    log_action(
        db, "recurring_created",
        resident_id=request.resident_id,
        details=f"Created recurring visitor: {request.name}, {request.schedule}"
    )
    
    db.commit()
    db.refresh(recurring)
    
    return RecurringVisitorResponse(
        id=recurring.id,
        resident_id=recurring.resident_id,
        name=recurring.name,
        schedule=recurring.schedule,
        time_window=recurring.time_window,
        photo_url=recurring.photo_url,
        is_active=recurring.is_active,
        created_at=recurring.created_at
    )


@router.get("/")
def list_recurring_visitors(
    resident_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all recurring visitors, optionally filtered by resident"""
    query = db.query(RecurringVisitor)
    
    if resident_id:
        query = query.filter(RecurringVisitor.resident_id == resident_id)
    
    recurring = query.all()
    
    results = []
    today = datetime.utcnow().weekday()
    
    for r in recurring:
        schedule_days = parse_schedule(r.schedule)
        
        # Calculate next visit
        next_visit = None
        for i in range(7):
            check_day = (today + i) % 7
            if check_day in schedule_days:
                next_date = datetime.utcnow() + timedelta(days=i)
                start_time, _ = parse_time_window(r.time_window)
                next_visit = f"{next_date.strftime('%A')} {start_time}"
                break
        
        results.append({
            "id": r.id,
            "resident_id": r.resident_id,
            "name": r.name,
            "schedule": r.schedule,
            "time_window": r.time_window,
            "photo_url": r.photo_url,
            "is_active": r.is_active,
            "next_visit": next_visit,
            "created_at": r.created_at
        })
    
    return {"recurring_visitors": results, "count": len(results)}


@router.put("/{recurring_id}")
def update_recurring_visitor(
    recurring_id: int,
    is_active: Optional[bool] = None,
    schedule: Optional[str] = None,
    time_window: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update a recurring visitor's schedule or status"""
    recurring = db.query(RecurringVisitor).filter(RecurringVisitor.id == recurring_id).first()
    if not recurring:
        raise HTTPException(status_code=404, detail="Recurring visitor not found")
    
    if is_active is not None:
        recurring.is_active = is_active
    if schedule:
        recurring.schedule = schedule
    if time_window:
        recurring.time_window = time_window
    
    db.commit()
    
    return {"message": "Recurring visitor updated", "id": recurring_id}


@router.delete("/{recurring_id}")
def delete_recurring_visitor(
    recurring_id: int,
    db: Session = Depends(get_db)
):
    """Delete a recurring visitor"""
    recurring = db.query(RecurringVisitor).filter(RecurringVisitor.id == recurring_id).first()
    if not recurring:
        raise HTTPException(status_code=404, detail="Recurring visitor not found")
    
    db.delete(recurring)
    db.commit()
    
    return {"message": "Recurring visitor deleted", "id": recurring_id}


@router.post("/{recurring_id}/pause")
def pause_recurring_visitor(
    recurring_id: int,
    db: Session = Depends(get_db)
):
    """Temporarily pause a recurring visitor"""
    recurring = db.query(RecurringVisitor).filter(RecurringVisitor.id == recurring_id).first()
    if not recurring:
        raise HTTPException(status_code=404, detail="Recurring visitor not found")
    
    recurring.is_active = False
    db.commit()
    
    return {"message": "Recurring visitor paused", "id": recurring_id}


@router.post("/generate-today")
def generate_today_approvals(
    resident_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Generate approvals for today based on recurring visitor schedules.
    Called by background job or manually for testing.
    """
    today = datetime.utcnow().weekday()
    
    query = db.query(RecurringVisitor).filter(RecurringVisitor.is_active == True)
    if resident_id:
        query = query.filter(RecurringVisitor.resident_id == resident_id)
    
    recurring_visitors = query.all()
    approvals_created = 0
    
    for rv in recurring_visitors:
        schedule_days = parse_schedule(rv.schedule)
        
        if today not in schedule_days:
            continue
        
        # Parse time window
        start_time, end_time = parse_time_window(rv.time_window)
        
        # Create visitor
        visitor = Visitor(
            name=rv.name,
            purpose="Recurring visit",
            photo_url=rv.photo_url
        )
        db.add(visitor)
        db.flush()
        
        # Calculate valid times
        valid_from = parse_time_string(start_time)
        valid_until = parse_time_string(end_time)
        
        if valid_from:
            valid_from = valid_from - timedelta(minutes=15)  # 15 min grace
        if not valid_until:
            valid_until = datetime.utcnow().replace(hour=23, minute=59)
        
        # Create approval
        approval = Approval(
            resident_id=rv.resident_id,
            visitor_id=visitor.id,
            status="approved",
            valid_from=valid_from or datetime.utcnow(),
            valid_until=valid_until,
            approval_method="recurring",
            approved_at=datetime.utcnow()
        )
        db.add(approval)
        
        log_action(
            db, "recurring_auto",
            resident_id=rv.resident_id,
            visitor_id=visitor.id,
            details=f"Auto-approved recurring: {rv.name}"
        )
        
        approvals_created += 1
    
    db.commit()
    
    return {
        "message": f"Generated {approvals_created} approvals for today",
        "approvals_created": approvals_created,
        "date": datetime.utcnow().strftime("%Y-%m-%d")
    }
