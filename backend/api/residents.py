"""
Resident dashboard endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import ResidentCreate, ResidentResponse

router = APIRouter(prefix="/api/residents", tags=["residents"])


@router.post("/register", response_model=ResidentResponse)
def register_resident(resident: ResidentCreate, db: Session = Depends(get_db)):
    """Register a new resident"""
    pass


@router.get("/{resident_id}", response_model=ResidentResponse)
def get_resident(resident_id: int, db: Session = Depends(get_db)):
    """Get resident profile"""
    pass


@router.get("/{resident_id}/approvals")
def get_resident_approvals(resident_id: int, db: Session = Depends(get_db)):
    """Get all approval requests for resident"""
    pass


@router.post("/approvals/{approval_id}/approve")
def approve_visitor(approval_id: int, db: Session = Depends(get_db)):
    """Approve a visitor request"""
    pass


@router.post("/approvals/{approval_id}/reject")
def reject_visitor(approval_id: int, db: Session = Depends(get_db)):
    """Reject a visitor request"""
    pass
