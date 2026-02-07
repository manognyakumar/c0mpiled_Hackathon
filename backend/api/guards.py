"""
Guard Operations API Endpoints
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Guard, Approval, Visitor, Resident
from utils.audit_logger import log_action

router = APIRouter(prefix="/api/guards", tags=["guards"])


@router.get("/active-approvals")
def get_active_approvals(db: Session = Depends(get_db)):
    """
    Get all currently valid/approved visitors.
    For guard to see who can enter.
    """
    now = datetime.utcnow()
    
    approvals = db.query(Approval).filter(
        Approval.status == "approved",
        Approval.valid_from <= now,
        Approval.valid_until >= now
    ).all()
    
    results = []
    for approval in approvals:
        visitor = db.query(Visitor).filter(Visitor.id == approval.visitor_id).first()
        resident = db.query(Resident).filter(Resident.id == approval.resident_id).first()
        
        if visitor and resident:
            results.append({
                "approval_id": approval.id,
                "visitor_id": visitor.id,
                "visitor_name": visitor.name,
                "purpose": visitor.purpose,
                "photo_url": visitor.photo_url,
                "apt_number": resident.apt_number,
                "resident_name": resident.name,
                "valid_from": approval.valid_from,
                "valid_until": approval.valid_until,
                "time_remaining_mins": int((approval.valid_until - now).total_seconds() / 60)
            })
    
    return {
        "active_approvals": results,
        "count": len(results),
        "checked_at": now
    }


@router.get("/expected-today")
def get_expected_today(db: Session = Depends(get_db)):
    """
    Get all visitors expected today (pending + approved).
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    approvals = db.query(Approval).filter(
        Approval.status.in_(["pending", "approved"]),
        Approval.created_at >= today_start,
        Approval.created_at < today_end
    ).all()
    
    results = []
    for approval in approvals:
        visitor = db.query(Visitor).filter(Visitor.id == approval.visitor_id).first()
        resident = db.query(Resident).filter(Resident.id == approval.resident_id).first()
        
        if visitor and resident:
            results.append({
                "approval_id": approval.id,
                "status": approval.status,
                "visitor_name": visitor.name,
                "purpose": visitor.purpose,
                "photo_url": visitor.photo_url,
                "apt_number": resident.apt_number,
                "resident_name": resident.name,
                "valid_from": approval.valid_from,
                "valid_until": approval.valid_until,
                "created_at": approval.created_at
            })
    
    # Group by status
    pending = [r for r in results if r["status"] == "pending"]
    approved = [r for r in results if r["status"] == "approved"]
    
    return {
        "date": today_start.strftime("%Y-%m-%d"),
        "total_expected": len(results),
        "pending": pending,
        "pending_count": len(pending),
        "approved": approved,
        "approved_count": len(approved)
    }


@router.post("/check-in/{approval_id}")
def check_in_visitor(
    approval_id: int,
    guard_id: int = 1,  # Default guard for demo
    db: Session = Depends(get_db)
):
    """
    Guard records visitor check-in.
    """
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    if approval.status != "approved":
        raise HTTPException(status_code=400, detail=f"Cannot check-in - status is {approval.status}")
    
    now = datetime.utcnow()
    
    # Verify within valid time window
    if approval.valid_from and approval.valid_until:
        if not (approval.valid_from <= now <= approval.valid_until):
            raise HTTPException(status_code=400, detail="Approval not valid at this time")
    
    # Log check-in
    log_action(db, "checked_in",
               resident_id=approval.resident_id,
               visitor_id=approval.visitor_id,
               guard_id=guard_id,
               details=f"Visitor checked in at {now}")
    
    db.commit()
    
    visitor = db.query(Visitor).filter(Visitor.id == approval.visitor_id).first()
    
    return {
        "message": "Visitor checked in successfully",
        "approval_id": approval_id,
        "visitor_name": visitor.name if visitor else "Unknown",
        "checked_in_at": now
    }


@router.get("/search")
def search_visitor(
    query: str,
    db: Session = Depends(get_db)
):
    """
    Guard searches for a visitor by name or phone.
    """
    visitors = db.query(Visitor).filter(
        (Visitor.name.ilike(f"%{query}%")) |
        (Visitor.phone.ilike(f"%{query}%"))
    ).all()
    
    if not visitors:
        return {"results": [], "count": 0, "message": "No visitors found"}
    
    now = datetime.utcnow()
    results = []
    
    for visitor in visitors:
        # Get latest approval
        approval = db.query(Approval).filter(
            Approval.visitor_id == visitor.id
        ).order_by(Approval.created_at.desc()).first()
        
        status_info = None
        if approval:
            resident = db.query(Resident).filter(Resident.id == approval.resident_id).first()
            is_valid_now = (
                approval.status == "approved" and
                approval.valid_from and approval.valid_until and
                approval.valid_from <= now <= approval.valid_until
            )
            status_info = {
                "approval_id": approval.id,
                "status": approval.status,
                "is_valid_now": is_valid_now,
                "valid_until": approval.valid_until,
                "apt_number": resident.apt_number if resident else None
            }
        
        results.append({
            "visitor_id": visitor.id,
            "name": visitor.name,
            "phone": visitor.phone,
            "photo_url": visitor.photo_url,
            "latest_approval": status_info
        })
    
    return {"results": results, "count": len(results)}


@router.get("/")
def list_guards(db: Session = Depends(get_db)):
    """List all guards (for demo)"""
    guards = db.query(Guard).filter(Guard.is_active == True).all()
    return {
        "guards": [
            {"id": g.id, "name": g.name, "phone": g.phone}
            for g in guards
        ],
        "count": len(guards)
    }
