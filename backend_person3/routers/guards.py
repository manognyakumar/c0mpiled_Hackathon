from fastapi import APIRouter

router = APIRouter()

# Endpoint to search for visitors
@router.get("/search")
def search_visitor(name: str = None, phone: str = None):
    return {"message": "Search visitor endpoint", "name": name, "phone": phone}

# Endpoint to get active approvals
@router.get("/active-approvals")
def get_active_approvals():
    return {"message": "Active approvals endpoint"}

# Endpoint to check in a visitor
@router.post("/check-in/{approval_id}")
def check_in_visitor(approval_id: int):
    return {"message": f"Visitor with approval ID {approval_id} checked in."}