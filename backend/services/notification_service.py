"""
Notification service: Push notifications, SMS, Email
"""


class NotificationService:
    """Send notifications to residents and guards"""

    def __init__(self):
        pass

    def send_approval_request(self, resident_id: int, visitor_name: str):
        """Send approval request notification to resident"""
        pass

    def send_approval_confirmation(self, resident_id: int, visitor_name: str):
        """Send approval confirmation notification"""
        pass

    def send_check_in_alert(self, resident_id: int, visitor_name: str):
        """Send check-in alert to resident"""
        pass

    def send_sms(self, phone_number: str, message: str):
        """Send SMS notification"""
        pass

    def send_push_notification(self, user_id: int, message: str):
        """Send push notification"""
        pass
