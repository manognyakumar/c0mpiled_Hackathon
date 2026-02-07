"""
Time window validation and enforcement
"""
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from models import Approval
from config import DEFAULT_APPROVAL_DURATION


def is_approval_valid(approval_id: int, db: Session) -> Tuple[bool, str]:
    """
    Check if an approval is currently valid.
    
    Returns:
        (is_valid: bool, reason: str)
    """
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    
    if not approval:
        return False, "Approval not found"
    
    if approval.status != "approved":
        return False, f"Status is {approval.status}"
    
    if not approval.valid_from or not approval.valid_until:
        return False, "No time window set"
    
    now = datetime.utcnow()
    
    if now < approval.valid_from:
        mins_until = int((approval.valid_from - now).total_seconds() / 60)
        return False, f"Not valid yet. Starts in {mins_until} minutes"
    
    if now > approval.valid_until:
        mins_ago = int((now - approval.valid_until).total_seconds() / 60)
        return False, f"Expired {mins_ago} minutes ago"
    
    return True, "Valid"


def calculate_time_window(
    scheduled_time: Optional[datetime] = None,
    duration_minutes: int = DEFAULT_APPROVAL_DURATION
) -> Tuple[datetime, datetime]:
    """
    Calculate valid_from and valid_until for an approval.
    
    Args:
        scheduled_time: When visitor is expected (default: now)
        duration_minutes: How long the approval is valid
    
    Returns:
        (valid_from, valid_until)
    """
    if scheduled_time is None:
        scheduled_time = datetime.utcnow()
    
    # Start 15 minutes before scheduled time
    valid_from = scheduled_time - timedelta(minutes=15)
    
    # End after duration
    valid_until = scheduled_time + timedelta(minutes=duration_minutes)
    
    return valid_from, valid_until


def check_and_expire_approvals(db: Session) -> int:
    """
    Check all approved approvals and mark expired ones.
    Called by background job.
    
    Returns:
        Number of approvals marked as expired
    """
    now = datetime.utcnow()
    
    expired_count = db.query(Approval).filter(
        Approval.status == "approved",
        Approval.valid_until < now
    ).update({"status": "expired"})
    
    db.commit()
    return expired_count


def parse_time_string(time_str: str, base_date: Optional[datetime] = None) -> Optional[datetime]:
    """
    Parse a time string (HH:MM) into a datetime.
    Uses base_date for the date portion, defaults to today.
    """
    if base_date is None:
        base_date = datetime.utcnow()
    
    try:
        # Try HH:MM format
        if ':' in time_str:
            parts = time_str.split(':')
            hour = int(parts[0])
            minute = int(parts[1]) if len(parts) > 1 else 0
        else:
            # Try just hour
            hour = int(time_str)
            minute = 0
        
        return base_date.replace(
            hour=hour, 
            minute=minute, 
            second=0, 
            microsecond=0
        )
    except (ValueError, IndexError):
        return None
