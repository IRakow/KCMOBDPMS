"""
User model
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
import enum

from .base import BaseModel, get_uuid_column


class UserRole(str, enum.Enum):
    """User role enumeration"""
    SUPER_ADMIN = "super_admin"
    COMPANY_ADMIN = "company_admin"
    PROPERTY_MANAGER = "property_manager"
    MAINTENANCE_STAFF = "maintenance_staff"
    LEASING_AGENT = "leasing_agent"
    ACCOUNTANT = "accountant"
    VIEWER = "viewer"


class User(BaseModel):
    """
    User model for authentication and authorization
    """
    __tablename__ = "users"
    
    # Authentication
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(50))
    
    # Role and Permissions
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Company Association
    company_id = Column(get_uuid_column(), ForeignKey("companies.id", ondelete="CASCADE"))
    
    # Security
    last_login = Column(DateTime)
    email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(255))
    password_reset_token = Column(String(255))
    password_reset_expires = Column(DateTime)
    
    # Relationships
    company = relationship("Company", back_populates="users")
    assigned_properties = relationship(
        "Property",
        secondary="user_property_assignments",
        back_populates="assigned_users"
    )
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def has_permission(self, permission: str) -> bool:
        """
        Check if user has a specific permission based on their role
        """
        # Define permission mappings based on roles
        permissions = {
            UserRole.SUPER_ADMIN: ["*"],  # All permissions
            UserRole.COMPANY_ADMIN: [
                "company:*", "property:*", "unit:*", "tenant:*", 
                "lease:*", "maintenance:*", "financial:*"
            ],
            UserRole.PROPERTY_MANAGER: [
                "property:read", "property:update", "unit:*", 
                "tenant:*", "lease:*", "maintenance:*"
            ],
            UserRole.MAINTENANCE_STAFF: [
                "property:read", "unit:read", "maintenance:*"
            ],
            UserRole.LEASING_AGENT: [
                "property:read", "unit:read", "tenant:*", "lease:*"
            ],
            UserRole.ACCOUNTANT: [
                "property:read", "unit:read", "tenant:read", 
                "lease:read", "financial:*"
            ],
            UserRole.VIEWER: [
                "property:read", "unit:read", "tenant:read", "lease:read"
            ],
        }
        
        user_permissions = permissions.get(self.role, [])
        
        # Check for wildcard permissions
        if "*" in user_permissions or f"{permission.split(':')[0]}:*" in user_permissions:
            return True
        
        return permission in user_permissions
    
    def __repr__(self):
        return f"<User(email='{self.email}', role='{self.role}', id='{self.id}')>"