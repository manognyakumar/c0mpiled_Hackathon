"""
Simple authentication for demo - Token-based
Production-grade JWT handling with structured logging
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status, Header
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from core import settings, logger, bind_context
from database import get_db
from models import Resident, Guard


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)


def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    """Verify JWT token from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        # Bind user context for logging
        if payload.get("user_id"):
            bind_context(user_id=payload["user_id"], user_type=payload.get("user_type"))
        return payload
    except JWTError as e:
        logger.warning("invalid_token_attempt", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


def get_current_resident(
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
) -> Resident:
    """Get current resident from token"""
    if token_data.get("user_type") != "resident":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Resident access required",
        )
    
    resident = db.query(Resident).filter(Resident.id == token_data.get("user_id")).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    return resident


def get_current_guard(
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
) -> Guard:
    """Get current guard from token"""
    if token_data.get("user_type") != "guard":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guard access required",
        )
    
    guard = db.query(Guard).filter(Guard.id == token_data.get("user_id")).first()
    if not guard:
        raise HTTPException(status_code=404, detail="Guard not found")
    return guard


def get_optional_auth(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Optional authentication - returns None if no token"""
    if not authorization:
        return None
    try:
        return verify_token(authorization)
    except HTTPException:
        return None


# Simple demo login (no password check for hackathon)
def demo_login(phone: str, user_type: str, db: Session) -> dict:
    """Demo login - just look up by phone, no password required"""
    if user_type == "resident":
        user = db.query(Resident).filter(Resident.phone == phone).first()
        if not user:
            raise HTTPException(status_code=404, detail="Resident not found")
    else:
        user = db.query(Guard).filter(Guard.phone == phone).first()
        if not user:
            raise HTTPException(status_code=404, detail="Guard not found")
    
    token = create_access_token({
        "user_id": user.id,
        "user_type": user_type,
        "phone": phone
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_type": user_type,
        "user_id": user.id
    }
