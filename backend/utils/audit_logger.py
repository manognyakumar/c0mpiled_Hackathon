"""
Audit trail logging for compliance and security
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
import json


def log_action(
    db: Session,
    action: str,
    resident_id: Optional[int] = None,
    visitor_id: Optional[int] = None,
    guard_id: Optional[int] = None,
    details: Optional[str] = None
):
    """
    Log an action to the audit trail.
    
    Actions:
    - approval_requested: Guard creates new approval request
    - approved: Resident approves visitor
    - denied: Resident denies visitor
    - checked_in: Guard records visitor entry
    - checked_out: Guard records visitor exit
    - voice_command: Resident uses voice to create approval
    - calendar_sync: Auto-approval from calendar
    - recurring_auto: Auto-approval from recurring schedule
    """
    from models import AuditLog
    
    log_entry = AuditLog(
        timestamp=datetime.utcnow(),
        action=action,
        resident_id=resident_id,
        visitor_id=visitor_id,
        guard_id=guard_id,
        details=details
    )
    
    db.add(log_entry)
    # Note: Caller should commit the transaction


def get_audit_trail(
    db: Session,
    resident_id: Optional[int] = None,
    visitor_id: Optional[int] = None,
    limit: int = 50
) -> list:
    """Get audit trail entries"""
    from models import AuditLog
    
    query = db.query(AuditLog)
    
    if resident_id:
        query = query.filter(AuditLog.resident_id == resident_id)
    if visitor_id:
        query = query.filter(AuditLog.visitor_id == visitor_id)
    
    entries = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "action": e.action,
            "resident_id": e.resident_id,
            "visitor_id": e.visitor_id,
            "guard_id": e.guard_id,
            "details": e.details
        }
        for e in entries
    ]
