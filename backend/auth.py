"""
Simple authentication for demo - Token-based
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_db
from models import Resident, Guard


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
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
