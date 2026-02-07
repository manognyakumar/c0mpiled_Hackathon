from fastapi import APIRouter

router = APIRouter()

# Endpoint to request visitor approval
@router.post("/request-approval")
def request_approval(visitor_name: str, visitor_photo: str):
    return {"message": f"Approval requested for visitor {visitor_name} with photo {visitor_photo}"}

# Endpoint to check visitor status
@router.get("/check-status")
def check_status(visitor_id: int):
    return {"message": f"Status for visitor ID {visitor_id}"}