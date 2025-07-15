"""
Simple notification service for development
"""

class NotificationService:
    @staticmethod
    def send_notification(user_id, message, notification_type="info"):
        """Send notification to user"""
        print(f"Notification to {user_id}: {message} (type: {notification_type})")
        return True
    
    @staticmethod
    def send_email(to_email, subject, body):
        """Send email notification"""
        print(f"Email to {to_email}: {subject}")
        return True
    
    @staticmethod
    def send_sms(phone_number, message):
        """Send SMS notification"""
        print(f"SMS to {phone_number}: {message}")
        return True