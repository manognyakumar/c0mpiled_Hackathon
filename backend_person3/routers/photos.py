from fastapi import APIRouter, UploadFile, HTTPException
from services.photo_manager import upload_photo, get_photo_url, delete_photo

router = APIRouter()

# Endpoint to upload a photo
@router.post("/upload")
def upload_visitor_photo(visitor_id: int, photo: UploadFile):
    try:
        file_location = upload_photo(visitor_id, photo)
        return {"message": "Photo uploaded successfully", "file_location": file_location}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to retrieve a photo
@router.get("/{visitor_id}")
def retrieve_visitor_photo(visitor_id: int, filename: str):
    try:
        photo_url = get_photo_url(visitor_id, filename)
        return {"photo_url": photo_url}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Photo not found")

# Endpoint to delete a photo
@router.delete("/{visitor_id}")
def delete_visitor_photo(visitor_id: int, filename: str):
    try:
        success = delete_photo(visitor_id, filename)
        if success:
            return {"message": "Photo deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Photo not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))