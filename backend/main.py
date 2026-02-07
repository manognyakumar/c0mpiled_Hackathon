"""
FastAPI app entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import visitors, residents, guards, voice, recurring, calendar
from background.scheduler import start_background_jobs

app = FastAPI(title="Visitor Management System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.on_event("startup")
async def startup_event():
    """Start background jobs on app startup"""
    start_background_jobs()

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"message": "Visitor Management System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
