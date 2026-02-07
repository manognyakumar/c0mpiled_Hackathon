"""
Pydantic models for request/response validation
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ============== Visitor Schemas ==============

class VisitorBase(BaseModel):
    name: str
    purpose: Optional[str] = None
    phone: Optional[str] = None


class VisitorCreate(VisitorBase):
    pass


class VisitorResponse(VisitorBase):
    id: int
    photo_url: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ============== Resident Schemas ==============

class ResidentBase(BaseModel):
    apt_number: str
    name: str
    phone: str
    preferred_language: str = "en"


class ResidentCreate(ResidentBase):
    password: Optional[str] = None


class ResidentResponse(ResidentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Approval Schemas ==============

class ApprovalRequestCreate(BaseModel):
    """Guard creates approval request for a visitor"""
    visitor_name: str
    visitor_phone: Optional[str] = None
    purpose: str
    apt_number: str  # Guard enters apartment number
    photo_url: Optional[str] = None


class ApprovalAction(BaseModel):
    """Resident approves a visitor"""
    approval_id: int
    valid_until: Optional[datetime] = None


class ApprovalDeny(BaseModel):
    """Resident denies a visitor"""
    approval_id: int
    reason: Optional[str] = None


class ApprovalResponse(BaseModel):
    id: int
    resident_id: int
    visitor_id: int
    status: str
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    approval_method: str
    created_at: datetime
    approved_at: Optional[datetime] = None
    visitor: Optional[VisitorResponse] = None
    resident: Optional[ResidentResponse] = None

    class Config:
        from_attributes = True


class ApprovalStatusResponse(BaseModel):
    """Response for guard checking visitor status"""
    approval_id: int
    status: str
    visitor_name: str
    purpose: Optional[str] = None
    photo_url: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_valid_now: bool
    apt_number: str
    resident_name: str


# ============== Schedule Schemas ==============

class ScheduleVisitor(BaseModel):
    approval_id: int
    visitor_id: int
    visitor_name: str
    purpose: Optional[str] = None
    photo_url: Optional[str] = None
    status: str
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    approval_method: str


class TodayScheduleResponse(BaseModel):
    resident_id: int
    resident_name: str
    apt_number: str
    date: str
    visitors: List[ScheduleVisitor]
    total_count: int
    pending_count: int
    approved_count: int


# ============== Recurring Visitor Schemas ==============

class RecurringVisitorCreate(BaseModel):
    resident_id: int
    name: str
    schedule: str
    time_window: str
    photo_url: Optional[str] = None


class RecurringVisitorResponse(BaseModel):
    id: int
    resident_id: int
    name: str
    schedule: str
    time_window: str
    photo_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Voice Processing Schemas ==============

class VoiceProcessResponse(BaseModel):
    success: bool
    transcript: str
    language: str
    extracted: dict
    approval_id: Optional[int] = None
    message: str


# ============== Calendar Schemas ==============

class CalendarEvent(BaseModel):
    title: str
    time: str
    date: Optional[str] = None


class CalendarSyncRequest(BaseModel):
    resident_id: int
    events: List[CalendarEvent]


class CalendarSyncResponse(BaseModel):
    success: bool
    events_processed: int
    approvals_created: int


# ============== Auth Schemas ==============

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str
    user_id: int


class LoginRequest(BaseModel):
    phone: str
    password: Optional[str] = None
    user_type: str = "resident"
