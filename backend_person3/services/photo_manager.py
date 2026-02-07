import os
from fastapi import UploadFile

UPLOAD_DIR = "uploads"

# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def upload_photo(visitor_id: int, photo_file: UploadFile):
    file_location = os.path.join(UPLOAD_DIR, f"visitor_{visitor_id}_{photo_file.filename}")
    with open(file_location, "wb") as file:
        file.write(photo_file.file.read())
    return file_location

def get_photo_url(visitor_id: int, filename: str):
    return os.path.join(UPLOAD_DIR, f"visitor_{visitor_id}_{filename}")

def delete_photo(visitor_id: int, filename: str):
    file_location = os.path.join(UPLOAD_DIR, f"visitor_{visitor_id}_{filename}")
    if os.path.exists(file_location):
        os.remove(file_location)
        return True
    return False