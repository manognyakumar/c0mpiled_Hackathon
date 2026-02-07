from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Guard(Base):
    __tablename__ = "guards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    phone = Column(String, unique=True, nullable=True)

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    visitor_id = Column(Integer, ForeignKey("visitors.id"), nullable=False)
    guard_id = Column(Integer, ForeignKey("guards.id"), nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, nullable=False)

    visitor = relationship("Visitor")
    guard = relationship("Guard")