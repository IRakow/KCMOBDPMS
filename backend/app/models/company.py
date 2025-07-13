"""
Company model
"""
from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.orm import relationship

from .base import BaseModel


class Company(BaseModel):
    """
    Company model representing property management companies
    """
    __tablename__ = "companies"
    
    # Basic Information
    name = Column(String(255), nullable=False, unique=True)
    legal_name = Column(String(255))
    tax_id = Column(String(50))
    
    # Contact Information
    email = Column(String(255), nullable=False)
    phone = Column(String(50))
    website = Column(String(255))
    
    # Address
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(50))
    postal_code = Column(String(20))
    country = Column(String(100), default="United States")
    
    # Settings
    settings = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    
    # Subscription/Plan Information
    subscription_plan = Column(String(50), default="basic")
    subscription_status = Column(String(50), default="active")
    
    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    properties = relationship("Property", back_populates="company", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Company(name='{self.name}', id='{self.id}')>"