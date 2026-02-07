"""
Resident Dashboard API Endpoints
GET /api/residents/{id}/schedule-today
GET /api/residents/{id}/pending-approvals
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from database import get_db
from models import Resident, Approval, Visitor
from schemas import TodayScheduleResponse, ScheduleVisitor, ResidentResponse

router = APIRouter(prefix="/api/residents", tags=["residents"])


@router.get("/{resident_id}/schedule-today", response_model=TodayScheduleResponse)
def get_schedule_today(
    resident_id: int,
    db: Session = Depends(get_db)
):
    """
    Get today's visitor schedule for a resident.
    Shows all approvals created or valid for today.
    """
    resident = db.query(Resident).filter(Resident.id == resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    # Get today's date range
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    # Get all approvals for today (created today or valid today)
    approvals = db.query(Approval).filter(
        Approval.resident_id == resident_id,
        # Either created today OR valid window includes today
        ((Approval.created_at >= today_start) & (Approval.created_at < today_end)) |
        ((Approval.valid_from != None) & (Approval.valid_from < today_end) & (Approval.valid_until >= today_start))
    ).order_by(Approval.created_at.desc()).all()
    
    visitors = []
    pending_count = 0
    approved_count = 0
    
    for approval in approvals:
        visitor = db.query(Visitor).filter(Visitor.id == approval.visitor_id).first()
        if visitor:
            visitors.append(ScheduleVisitor(
                approval_id=approval.id,
                visitor_id=visitor.id,
                visitor_name=visitor.name,
                purpose=visitor.purpose,
                photo_url=visitor.photo_url,
                status=approval.status,
                valid_from=approval.valid_from,
                valid_until=approval.valid_until,
                approval_method=approval.approval_method
            ))
            
            if approval.status == "pending":
                pending_count += 1
            elif approval.status == "approved":
                approved_count += 1
    
    return TodayScheduleResponse(
        resident_id=resident.id,
        resident_name=resident.name,
        apt_number=resident.apt_number,
        date=today_start.strftime("%Y-%m-%d"),
        visitors=visitors,
        total_count=len(visitors),
        pending_count=pending_count,
        approved_count=approved_count
    )


@router.get("/{resident_id}/pending-approvals")
def get_pending_approvals(
    resident_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all pending approval requests for a resident.
    Used for the approval notification screen.
    """
    resident = db.query(Resident).filter(Resident.id == resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    approvals = db.query(Approval).filter(
        Approval.resident_id == resident_id,
        Approval.status == "pending"
    ).order_by(Approval.created_at.desc()).all()
    
    results = []
    for approval in approvals:
        visitor = db.query(Visitor).filter(Visitor.id == approval.visitor_id).first()
        if visitor:
            results.append({
                "approval_id": approval.id,
                "visitor_id": visitor.id,
                "visitor_name": visitor.name,
                "visitor_phone": visitor.phone,
                "purpose": visitor.purpose,
                "photo_url": visitor.photo_url,
                "created_at": approval.created_at,
                "approval_method": approval.approval_method
            })
    
    return {
        "resident_id": resident_id,
        "pending_count": len(results),
        "approvals": results
    }


@router.get("/{resident_id}", response_model=ResidentResponse)
def get_resident(
    resident_id: int,
    db: Session = Depends(get_db)
):
    """Get resident profile by ID"""
    resident = db.query(Resident).filter(Resident.id == resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    return ResidentResponse(
        id=resident.id,
        apt_number=resident.apt_number,
        name=resident.name,
        phone=resident.phone,
        preferred_language=resident.preferred_language,
        created_at=resident.created_at
    )


@router.get("/by-apt/{apt_number}", response_model=ResidentResponse)
def get_resident_by_apt(
    apt_number: str,
    db: Session = Depends(get_db)
):
    """Get resident profile by apartment number"""
    resident = db.query(Resident).filter(Resident.apt_number == apt_number).first()
    if not resident:
        raise HTTPException(status_code=404, detail=f"No resident found for apartment {apt_number}")
    
    return ResidentResponse(
        id=resident.id,
        apt_number=resident.apt_number,
        name=resident.name,
        phone=resident.phone,
        preferred_language=resident.preferred_language,
        created_at=resident.created_at
    )


@router.get("/")
def list_residents(db: Session = Depends(get_db)):
    """List all residents (for demo/testing)"""
    residents = db.query(Resident).all()
    return {
        "residents": [
            {
                "id": r.id,
                "apt_number": r.apt_number,
                "name": r.name,
                "phone": r.phone,
                "preferred_language": r.preferred_language
            }
            for r in residents
        ],
        "count": len(residents)
    }
