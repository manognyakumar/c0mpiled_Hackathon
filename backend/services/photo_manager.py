"""
Photo upload and storage management
"""


class PhotoManager:
    """Manage visitor photo uploads and storage"""

    def __init__(self):
        pass

    def upload_photo(self, visitor_id: int, photo_file) -> str:
        """Upload and store visitor photo"""
        pass

    def get_photo_url(self, visitor_id: int) -> str:
        """Get URL for visitor photo"""
        pass

    def delete_photo(self, visitor_id: int):
        """Delete visitor photo"""
        pass

    def resize_photo(self, photo_path: str, width: int, height: int):
        """Resize photo to specified dimensions"""
        pass
