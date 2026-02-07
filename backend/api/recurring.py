"""
Recurring visitor management endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(prefix="/api/recurring", tags=["recurring"])


@router.post("/create")
def create_recurring_visitor(resident_id: int, visitor_id: int, frequency: str, db: Session = Depends(get_db)):
    """Create a recurring visitor schedule"""
    pass


@router.get("/{resident_id}/schedules")
def get_recurring_schedules(resident_id: int, db: Session = Depends(get_db)):
    """Get all recurring visitor schedules for a resident"""
    pass


@router.put("/{schedule_id}/update")
def update_recurring_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Update a recurring visitor schedule"""
    pass


@router.delete("/{schedule_id}")
def delete_recurring_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Delete a recurring visitor schedule"""
    pass
