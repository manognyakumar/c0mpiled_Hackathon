"""
Pydantic models for request/response validation
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class VisitorBase(BaseModel):
    """Base visitor schema"""
    name: str
    email: EmailStr
    phone: str


class VisitorCreate(VisitorBase):
    """Create visitor schema"""
    pass


class VisitorResponse(VisitorBase):
    """Visitor response schema"""
    id: int
    photo_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ResidentBase(BaseModel):
    """Base resident schema"""
    name: str
    email: EmailStr
    phone: str
    unit_number: str


class ResidentCreate(ResidentBase):
    """Create resident schema"""
    password: str


class ResidentResponse(ResidentBase):
    """Resident response schema"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class VisitorApprovalBase(BaseModel):
    """Base visitor approval schema"""
    visitor_id: int
    resident_id: int
    visit_date: datetime
    visit_start_time: str
    visit_end_time: str
    purpose: str


class VisitorApprovalCreate(VisitorApprovalBase):
    """Create visitor approval schema"""
    pass


class VisitorApprovalResponse(VisitorApprovalBase):
    """Visitor approval response schema"""
    id: int
    status: str
    qr_code: Optional[str] = None
    created_at: datetime
    approved_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    visitor: VisitorResponse
    resident: ResidentResponse

    class Config:
        from_attributes = True


class GuardBase(BaseModel):
    """Base guard schema"""
    name: str
    email: EmailStr
    phone: str
    shift_start: str
    shift_end: str


class GuardCreate(GuardBase):
    """Create guard schema"""
    password: str


class GuardResponse(GuardBase):
    """Guard response schema"""
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CheckInRequest(BaseModel):
    """Check-in request schema"""
    approval_id: int
    entry_point: str
    temperature: Optional[float] = None


class CheckInResponse(BaseModel):
    """Check-in response schema"""
    id: int
    approval_id: int
    check_in_time: datetime
    entry_point: str
    temperature: Optional[float] = None

    class Config:
        from_attributes = True
