"""
Simple auth service for development
"""

class AuthService:
    @staticmethod
    def get_current_user():
        """Get current authenticated user"""
        return {"id": "1", "username": "admin", "email": "admin@example.com"}
    
    @staticmethod
    def verify_token(token):
        """Verify JWT token"""
        return True
    
    @staticmethod
    def create_token(user_data):
        """Create JWT token"""
        return "mock_token"

# For direct import compatibility
def get_current_user():
    """Get current authenticated user"""
    return {"id": "1", "username": "admin", "email": "admin@example.com"}