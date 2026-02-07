"""
Visitor Management API Endpoints
POST /api/visitors/request-approval
POST /api/visitors/approve
POST /api/visitors/deny
GET  /api/visitors/check-status/{visitor_id}
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import Visitor, Approval, Resident, AuditLog
from schemas import (
    ApprovalRequestCreate, ApprovalAction, ApprovalDeny,
    ApprovalResponse, ApprovalStatusResponse, VisitorResponse
)
from config import DEFAULT_APPROVAL_DURATION
from utils.audit_logger import log_action

router = APIRouter(prefix="/api/visitors", tags=["visitors"])


@router.post("/request-approval", response_model=ApprovalResponse)
def request_approval(
    request: ApprovalRequestCreate,
    db: Session = Depends(get_db)
):
    """
    Guard creates a new visitor approval request.
    Finds resident by apartment number, creates visitor record, creates pending approval.
    """
    # Find resident by apartment number
    resident = db.query(Resident).filter(Resident.apt_number == request.apt_number).first()
    if not resident:
        raise HTTPException(status_code=404, detail=f"No resident found for apartment {request.apt_number}")
    
    # Create or find visitor
    visitor = db.query(Visitor).filter(
        Visitor.name == request.visitor_name,
        Visitor.phone == request.visitor_phone
    ).first()
    
    if not visitor:
        visitor = Visitor(
            name=request.visitor_name,
            phone=request.visitor_phone,
            purpose=request.purpose,
            photo_url=request.photo_url
        )
        db.add(visitor)
        db.flush()
    
    # Create pending approval
    approval = Approval(
        resident_id=resident.id,
        visitor_id=visitor.id,
        status="pending",
        approval_method="manual"
    )
    db.add(approval)
    db.flush()
    
    # Log the action
    log_action(db, "approval_requested", 
               resident_id=resident.id, 
               visitor_id=visitor.id,
               details=f"Visitor {visitor.name} requesting access to apt {request.apt_number}")
    
    db.commit()
    db.refresh(approval)
    
    # Build response
    return ApprovalResponse(
        id=approval.id,
        resident_id=approval.resident_id,
        visitor_id=approval.visitor_id,
        status=approval.status,
        valid_from=approval.valid_from,
        valid_until=approval.valid_until,
        approval_method=approval.approval_method,
        created_at=approval.created_at,
        approved_at=approval.approved_at,
        visitor=VisitorResponse(
            id=visitor.id,
            name=visitor.name,
            purpose=visitor.purpose,
            phone=visitor.phone,
            photo_url=visitor.photo_url,
            timestamp=visitor.timestamp
        )
    )


@router.post("/approve", response_model=ApprovalResponse)
def approve_visitor(
    action: ApprovalAction,
    db: Session = Depends(get_db)
):
    """
    Resident approves a pending visitor request.
    Sets valid_from to now, valid_until to specified time or default (90 mins).
    """
    approval = db.query(Approval).filter(Approval.id == action.approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot approve - status is {approval.status}")
    
    now = datetime.utcnow()
    approval.status = "approved"
    approval.approved_at = now
    approval.valid_from = now
    
    if action.valid_until:
        approval.valid_until = action.valid_until
    else:
        # Default: 90 minutes from now
        approval.valid_until = now + timedelta(minutes=DEFAULT_APPROVAL_DURATION)
    
    # Log the action
    log_action(db, "approved", 
               resident_id=approval.resident_id, 
               visitor_id=approval.visitor_id,
               details=f"Valid until {approval.valid_until}")
    
    db.commit()
    db.refresh(approval)
    
    visitor = db.query(Visitor).filter(Visitor.id == approval.visitor_id).first()
    
    return ApprovalResponse(
        id=approval.id,
        resident_id=approval.resident_id,
        visitor_id=approval.visitor_id,
        status=approval.status,
        valid_from=approval.valid_from,
        valid_until=approval.valid_until,
        approval_method=approval.approval_method,
        created_at=approval.created_at,
        approved_at=approval.approved_at,
        visitor=VisitorResponse(
            id=visitor.id,
            name=visitor.name,
            purpose=visitor.purpose,
            phone=visitor.phone,
            photo_url=visitor.photo_url,
            timestamp=visitor.timestamp
        ) if visitor else None
    )


@router.post("/deny")
def deny_visitor(
    action: ApprovalDeny,
    db: Session = Depends(get_db)
):
    """
    Resident denies a pending visitor request.
    """
    approval = db.query(Approval).filter(Approval.id == action.approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot deny - status is {approval.status}")
    
    approval.status = "denied"
    approval.denied_at = datetime.utcnow()
    approval.deny_reason = action.reason
    
    # Log the action
    log_action(db, "denied", 
               resident_id=approval.resident_id, 
               visitor_id=approval.visitor_id,
               details=f"Reason: {action.reason or 'No reason provided'}")
    
    db.commit()
    
    return {"message": "Visitor denied", "approval_id": approval.id}


@router.get("/check-status/{visitor_id}", response_model=ApprovalStatusResponse)
def check_visitor_status(
    visitor_id: int,
    db: Session = Depends(get_db)
):
    """
    Guard checks if a visitor is currently authorized.
    Returns the most recent approval for this visitor.
    """
    # Get the most recent approval for this visitor
    approval = db.query(Approval).filter(
        Approval.visitor_id == visitor_id
    ).order_by(Approval.created_at.desc()).first()
    
    if not approval:
        raise HTTPException(status_code=404, detail="No approval found for this visitor")
    
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    resident = db.query(Resident).filter(Resident.id == approval.resident_id).first()
    
    # Check if currently valid
    now = datetime.utcnow()
    is_valid_now = (
        approval.status == "approved" and
        approval.valid_from is not None and
        approval.valid_until is not None and
        approval.valid_from <= now <= approval.valid_until
    )
    
    return ApprovalStatusResponse(
        approval_id=approval.id,
        status=approval.status,
        visitor_name=visitor.name if visitor else "Unknown",
        purpose=visitor.purpose if visitor else None,
        photo_url=visitor.photo_url if visitor else None,
        valid_from=approval.valid_from,
        valid_until=approval.valid_until,
        is_valid_now=is_valid_now,
        apt_number=resident.apt_number if resident else "Unknown",
        resident_name=resident.name if resident else "Unknown"
    )


@router.get("/check-by-name")
def check_by_name(
    name: str,
    db: Session = Depends(get_db)
):
    """
    Guard searches for a visitor by name.
    Returns matching visitors with their current status.
    """
    visitors = db.query(Visitor).filter(
        Visitor.name.ilike(f"%{name}%")
    ).all()
    
    if not visitors:
        raise HTTPException(status_code=404, detail="No visitors found with that name")
    
    results = []
    now = datetime.utcnow()
    
    for visitor in visitors:
        approval = db.query(Approval).filter(
            Approval.visitor_id == visitor.id
        ).order_by(Approval.created_at.desc()).first()
        
        if approval:
            resident = db.query(Resident).filter(Resident.id == approval.resident_id).first()
            is_valid_now = (
                approval.status == "approved" and
                approval.valid_from is not None and
                approval.valid_until is not None and
                approval.valid_from <= now <= approval.valid_until
            )
            
            results.append({
                "visitor_id": visitor.id,
                "visitor_name": visitor.name,
                "purpose": visitor.purpose,
                "photo_url": visitor.photo_url,
                "status": approval.status,
                "is_valid_now": is_valid_now,
                "valid_until": approval.valid_until,
                "apt_number": resident.apt_number if resident else None,
                "resident_name": resident.name if resident else None
            })
    
    return {"results": results, "count": len(results)}


@router.get("/pending")
def get_pending_approvals(
    db: Session = Depends(get_db)
):
    """Get all pending approvals (for demo/testing)"""
    approvals = db.query(Approval).filter(Approval.status == "pending").all()
    
    results = []
    for approval in approvals:
        visitor = db.query(Visitor).filter(Visitor.id == approval.visitor_id).first()
        resident = db.query(Resident).filter(Resident.id == approval.resident_id).first()
        
        results.append({
            "approval_id": approval.id,
            "visitor_name": visitor.name if visitor else "Unknown",
            "visitor_phone": visitor.phone if visitor else None,
            "purpose": visitor.purpose if visitor else None,
            "photo_url": visitor.photo_url if visitor else None,
            "apt_number": resident.apt_number if resident else "Unknown",
            "resident_name": resident.name if resident else "Unknown",
            "created_at": approval.created_at
        })
    
    return {"pending_approvals": results, "count": len(results)}
