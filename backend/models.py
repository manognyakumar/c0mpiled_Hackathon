"""
SQLAlchemy ORM models for the database
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Resident(Base):
    """Resident model"""
    __tablename__ = "residents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    unit_number = Column(String, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    visitor_approvals = relationship("VisitorApproval", back_populates="resident")


class Visitor(Base):
    """Visitor model"""
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    approvals = relationship("VisitorApproval", back_populates="visitor")


class VisitorApproval(Base):
    """Visitor approval request model"""
    __tablename__ = "visitor_approvals"

    id = Column(Integer, primary_key=True, index=True)
    visitor_id = Column(Integer, ForeignKey("visitors.id"))
    resident_id = Column(Integer, ForeignKey("residents.id"))
    status = Column(String, default="pending", index=True)  # pending, approved, rejected, expired
    visit_date = Column(DateTime, index=True)
    visit_start_time = Column(String)
    visit_end_time = Column(String)
    qr_code = Column(String, nullable=True)
    purpose = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    visitor = relationship("Visitor", back_populates="approvals")
    resident = relationship("Resident", back_populates="visitor_approvals")


class Guard(Base):
    """Guard model"""
    __tablename__ = "guards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    password_hash = Column(String)
    shift_start = Column(String)
    shift_end = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CheckIn(Base):
    """Visitor check-in record"""
    __tablename__ = "check_ins"

    id = Column(Integer, primary_key=True, index=True)
    approval_id = Column(Integer, ForeignKey("visitor_approvals.id"))
    guard_id = Column(Integer, ForeignKey("guards.id"))
    check_in_time = Column(DateTime, default=datetime.utcnow, index=True)
    check_out_time = Column(DateTime, nullable=True)
    entry_point = Column(String)
    temperature = Column(Float, nullable=True)


class RecurringVisitor(Base):
    """Recurring visitor schedule"""
    __tablename__ = "recurring_visitors"

    id = Column(Integer, primary_key=True, index=True)
    resident_id = Column(Integer, ForeignKey("residents.id"))
    visitor_id = Column(Integer, ForeignKey("visitors.id"))
    frequency = Column(String)  # daily, weekly, monthly
    day_of_week = Column(String, nullable=True)
    visit_time = Column(String)
    duration_minutes = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
