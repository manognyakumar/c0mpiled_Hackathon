from fastapi import FastAPI
from routers import guards, visitors, photos, recurring, notifications

app = FastAPI()

# Include routers for guards and visitors
app.include_router(guards.router, prefix="/api/guards", tags=["Guards"])
app.include_router(visitors.router, prefix="/api/visitors", tags=["Visitors"])
# Include the photos router
app.include_router(photos.router, prefix="/api/photos", tags=["Photos"])
# Include the recurring visitors router
app.include_router(recurring.router, prefix="/api/recurring-visitors", tags=["Recurring Visitors"])
# Include the notifications router
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

@app.get("/")
def root():
    return {"message": "Person 3 Backend for Guard App is running!"}