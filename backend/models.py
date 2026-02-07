"""
SQLAlchemy ORM models - Visitor Management System
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Resident(Base):
    """Resident model"""
    __tablename__ = "residents"

    id = Column(Integer, primary_key=True, index=True)
    apt_number = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    preferred_language = Column(String(10), default="en")  # 'en' or 'ar'
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    approvals = relationship("Approval", back_populates="resident")
    recurring_visitors = relationship("RecurringVisitor", back_populates="resident")


class Visitor(Base):
    """Visitor model"""
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    purpose = Column(String(255), nullable=True)
    photo_url = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    approvals = relationship("Approval", back_populates="visitor")


class Approval(Base):
    """Visitor approval model"""
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    resident_id = Column(Integer, ForeignKey("residents.id"), nullable=False)
    visitor_id = Column(Integer, ForeignKey("visitors.id"), nullable=False)
    status = Column(String(20), default="pending", index=True)  # pending, approved, denied, expired
    valid_from = Column(DateTime, nullable=True)
    valid_until = Column(DateTime, nullable=True)
    approval_method = Column(String(20), default="manual")  # manual, voice, calendar, recurring
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    denied_at = Column(DateTime, nullable=True)
    deny_reason = Column(String(255), nullable=True)

    resident = relationship("Resident", back_populates="approvals")
    visitor = relationship("Visitor", back_populates="approvals")


class RecurringVisitor(Base):
    """Recurring visitor schedule"""
    __tablename__ = "recurring_visitors"

    id = Column(Integer, primary_key=True, index=True)
    resident_id = Column(Integer, ForeignKey("residents.id"), nullable=False)
    name = Column(String(100), nullable=False)
    schedule = Column(String(100), nullable=False)  # e.g., "every_tuesday_thursday"
    time_window = Column(String(50), nullable=False)  # e.g., "09:00-12:00"
    photo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resident = relationship("Resident", back_populates="recurring_visitors")


class Guard(Base):
    """Guard model"""
    __tablename__ = "guards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    """Audit trail for all actions"""
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    resident_id = Column(Integer, ForeignKey("residents.id"), nullable=True)
    visitor_id = Column(Integer, ForeignKey("visitors.id"), nullable=True)
    guard_id = Column(Integer, ForeignKey("guards.id"), nullable=True)
    action = Column(String(50), nullable=False)  # approval_requested, approved, denied, checked_in, etc.
    details = Column(Text, nullable=True)  # JSON string for extra info
