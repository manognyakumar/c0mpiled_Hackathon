"""
Visitor request/approval endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import VisitorCreate, VisitorResponse, VisitorApprovalCreate, VisitorApprovalResponse

router = APIRouter(prefix="/api/visitors", tags=["visitors"])


@router.post("/", response_model=VisitorResponse)
def create_visitor(visitor: VisitorCreate, db: Session = Depends(get_db)):
    """Create a new visitor"""
    pass


@router.get("/{visitor_id}", response_model=VisitorResponse)
def get_visitor(visitor_id: int, db: Session = Depends(get_db)):
    """Get visitor details"""
    pass


@router.post("/request-approval", response_model=VisitorApprovalResponse)
def request_approval(approval: VisitorApprovalCreate, db: Session = Depends(get_db)):
    """Request visitor approval from resident"""
    pass


@router.get("/approvals/{approval_id}", response_model=VisitorApprovalResponse)
def get_approval(approval_id: int, db: Session = Depends(get_db)):
    """Get approval details"""
    pass
