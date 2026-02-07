"""
Guard check-in/status endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import CheckInRequest, CheckInResponse, GuardCreate, GuardResponse

router = APIRouter(prefix="/api/guards", tags=["guards"])


@router.post("/register", response_model=GuardResponse)
def register_guard(guard: GuardCreate, db: Session = Depends(get_db)):
    """Register a new guard"""
    pass


@router.get("/{guard_id}", response_model=GuardResponse)
def get_guard(guard_id: int, db: Session = Depends(get_db)):
    """Get guard profile"""
    pass


@router.post("/check-in", response_model=CheckInResponse)
def check_in_visitor(check_in: CheckInRequest, db: Session = Depends(get_db)):
    """Record visitor check-in"""
    pass


@router.post("/check-out/{check_in_id}")
def check_out_visitor(check_in_id: int, db: Session = Depends(get_db)):
    """Record visitor check-out"""
    pass


@router.get("/verify-qr/{qr_code}")
def verify_qr_code(qr_code: str, db: Session = Depends(get_db)):
    """Verify QR code and get visitor details"""
    pass
