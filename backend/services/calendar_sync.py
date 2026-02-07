"""
Calendar synchronization with Google Calendar and Outlook
"""


class CalendarSync:
    """Sync visitor approvals with external calendars"""

    def __init__(self):
        pass

    def sync_google_calendar(self, resident_id: int, access_token: str):
        """Sync with Google Calendar"""
        pass

    def sync_outlook_calendar(self, resident_id: int, access_token: str):
        """Sync with Outlook Calendar"""
        pass

    def create_calendar_event(self, approval_id: int, calendar_type: str):
        """Create calendar event for visitor approval"""
        pass

    def update_calendar_event(self, approval_id: int, calendar_type: str):
        """Update calendar event when approval status changes"""
        pass
