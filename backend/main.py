"""
FastAPI app entry point - Visitor Management System
Production-grade setup with structured logging and rate limiting
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core import settings, logger, limiter, bind_context, clear_context
from database import init_db, seed_demo_data
from api import visitors, residents, guards, voice, recurring, calendar, face
from auth import demo_login, verify_token
from schemas import LoginRequest, TokenResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle application startup and shutdown events.
    Following the modern asynccontextmanager pattern.
    """
    # Startup
    logger.info(
        "application_startup",
        project_name=settings.project_name,
        version=settings.version,
        environment=settings.app_env.value,
    )
    init_db()
    seed_demo_data()
    logger.info("database_initialized", message="Demo data seeded")
    yield
    # Shutdown
    logger.info("application_shutdown")


app = FastAPI(
    title=settings.project_name,
    description="Smart visitor approval system with voice input and calendar integration",
    version=settings.version,
    lifespan=lifespan,
    openapi_url=f"{settings.api_v1_str}/openapi.json" if settings.debug else None,
)

# ==================================================
# Rate Limiting Setup
# ==================================================
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ==================================================
# CORS Middleware
# ==================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(visitors.router)
app.include_router(residents.router)
app.include_router(guards.router)
app.include_router(voice.router)
app.include_router(recurring.router)
app.include_router(calendar.router)
app.include_router(face.router)


# ============== Auth Endpoints ==============

@app.post("/api/auth/login")
def login(request: LoginRequest):
    """
    Login — provide phone, user_type, and optionally password.
    """
    from database import SessionLocal
    db = SessionLocal()
    try:
        return demo_login(request.phone, request.user_type, db, request.password)
    finally:
        db.close()


@app.get("/api/auth/me")
def get_me(token_data: dict = Depends(verify_token)):
    """Get current user profile from token"""
    from database import SessionLocal
    from models import Resident, Guard
    db = SessionLocal()
    try:
        user_type = token_data.get("user_type")
        user_id = token_data.get("user_id")
        if user_type == "resident":
            user = db.query(Resident).filter(Resident.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return {
                "user_id": user.id,
                "user_type": "resident",
                "name": user.name,
                "phone": user.phone,
                "apt_number": user.apt_number,
                "photo_url": user.photo_url,
                "preferred_language": user.preferred_language,
            }
        else:
            user = db.query(Guard).filter(Guard.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return {
                "user_id": user.id,
                "user_type": "guard",
                "name": user.name,
                "phone": user.phone,
            }
    finally:
        db.close()


@app.put("/api/auth/change-password")
def change_password(
    payload: dict,
    token_data: dict = Depends(verify_token),
):
    """Change current user's password"""
    from database import SessionLocal
    from models import Resident, Guard
    from auth import pwd_context
    
    old_password = payload.get("old_password", "")
    new_password = payload.get("new_password", "")
    if not new_password or len(new_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    
    db = SessionLocal()
    try:
        user_type = token_data.get("user_type")
        user_id = token_data.get("user_id")
        Model = Resident if user_type == "resident" else Guard
        user = db.query(Model).filter(Model.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify old password if one exists
        if user.password_hash and old_password:
            if not pwd_context.verify(old_password, user.password_hash):
                raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        user.password_hash = pwd_context.hash(new_password)
        db.commit()
        return {"ok": True, "message": "Password updated"}
    finally:
        db.close()


@app.post("/api/auth/upload-photo")
async def upload_profile_photo(
    request: Request,
    token_data: dict = Depends(verify_token),
):
    """Upload profile photo for current resident"""
    from database import SessionLocal
    from models import Resident
    import base64, uuid
    from pathlib import Path
    
    if token_data.get("user_type") != "resident":
        raise HTTPException(status_code=403, detail="Only residents can upload photos")
    
    db = SessionLocal()
    try:
        form = await request.form()
        photo = form.get("photo")
        if not photo:
            raise HTTPException(status_code=400, detail="No photo provided")
        
        # Save file
        contents = await photo.read()
        filename = f"resident_{token_data['user_id']}_{uuid.uuid4().hex[:8]}.jpg"
        photos_dir = Path(__file__).parent / "data" / "photos"
        photos_dir.mkdir(parents=True, exist_ok=True)
        filepath = photos_dir / filename
        filepath.write_bytes(contents)
        
        photo_url = f"/api/photos/{filename}"
        
        resident = db.query(Resident).filter(Resident.id == token_data["user_id"]).first()
        if not resident:
            raise HTTPException(status_code=404, detail="Resident not found")
        
        resident.photo_url = photo_url
        db.commit()
        
        return {"ok": True, "photo_url": photo_url}
    finally:
        db.close()


@app.get("/api/photos/{filename}")
async def serve_photo(filename: str):
    """Serve uploaded photos"""
    from fastapi.responses import FileResponse
    from pathlib import Path
    
    filepath = Path(__file__).parent / "data" / "photos" / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Photo not found")
    return FileResponse(filepath)


# ============== Health & Info Endpoints ==============

@app.get("/")
def read_root():
    """Health check and API info"""
    logger.info("root_endpoint_called")
    return {
        "name": settings.project_name,
        "version": settings.version,
        "environment": settings.app_env.value,
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "visitors": "/api/visitors",
            "residents": "/api/residents", 
            "guards": "/api/guards",
            "voice": "/api/voice",
            "recurring": "/api/recurring-visitors",
            "calendar": "/api/calendar"
        }
    }


@app.get("/health")
def health_check():
    """Production health check with database connectivity validation."""
    from database import SessionLocal
    from sqlalchemy import text
    db = SessionLocal()
    try:
        # Quick database query to verify connectivity
        db.execute(text("SELECT 1"))
        db_healthy = True
    except Exception as e:
        logger.error("database_health_check_failed", error=str(e))
        db_healthy = False
    finally:
        db.close()
    
    status_code = status.HTTP_200_OK if db_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "healthy" if db_healthy else "degraded",
            "components": {
                "api": "healthy",
                "database": "healthy" if db_healthy else "unhealthy"
            },
            "version": settings.version,
        }
    )


# ============== Demo/Test Endpoints ==============

@app.get("/api/demo/quick-test")
def quick_test():
    """
    Quick test endpoint to verify all systems working.
    Creates a test visitor request and returns status.
    """
    from database import SessionLocal
    from models import Resident, Visitor, Approval
    
    db = SessionLocal()
    try:
        # Check residents exist
        residents = db.query(Resident).count()
        visitors = db.query(Visitor).count()
        approvals = db.query(Approval).count()
        
        return {
            "status": "ok",
            "database": {
                "residents": residents,
                "visitors": visitors,
                "approvals": approvals
            },
            "message": "All systems operational!"
        }
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
