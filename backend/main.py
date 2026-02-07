"""
FastAPI app entry point - Visitor Management System
Production-grade setup with structured logging and rate limiting
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core import settings, logger, limiter, bind_context, clear_context
from database import init_db, seed_demo_data
from api import visitors, residents, guards, voice, recurring, calendar
from auth import demo_login
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


# ============== Auth Endpoints ==============

@app.post("/api/auth/login", response_model=TokenResponse)
def login(request: LoginRequest):
    """
    Demo login - just provide phone number and user type.
    No password required for hackathon demo.
    """
    from database import SessionLocal
    db = SessionLocal()
    try:
        return demo_login(request.phone, request.user_type, db)
    finally:
        db.close()


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
    db = SessionLocal()
    try:
        # Quick database query to verify connectivity
        db.execute("SELECT 1")
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
