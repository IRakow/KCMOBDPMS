"""
Maintenance Request model
"""
from sqlalchemy import Column, String, Text, Enum, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

from .base import BaseModel


class MaintenanceStatus(str, enum.Enum):
    """Maintenance status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MaintenancePriority(str, enum.Enum):
    """Maintenance priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class MaintenanceRequest(BaseModel):
    """
    Maintenance request model for tracking property maintenance
    """
    __tablename__ = "maintenance_requests"
    
    # Basic Information
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Enum(MaintenancePriority), default=MaintenancePriority.MEDIUM, nullable=False)
    status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.PENDING, nullable=False)
    
    # Location
    unit_id = Column(String, ForeignKey("units.id"), nullable=False)
    
    # Requestor Information
    tenant_id = Column(String, ForeignKey("tenants.id"))  # Optional - can be reported by staff
    reported_by_name = Column(String(255))
    reported_by_phone = Column(String(50))
    reported_by_email = Column(String(255))
    
    # Assignment
    assigned_to = Column(String)  # Staff member name/ID
    
    # Scheduling
    scheduled_date = Column(DateTime)
    completed_date = Column(DateTime)
    
    # Financial
    estimated_cost = Column(Float)
    actual_cost = Column(Float)
    
    # Additional Information
    notes = Column(Text)
    photos = Column(Text)  # JSON array of photo URLs
    
    # Relationships
    unit = relationship("Unit", back_populates="maintenance_requests")
    tenant = relationship("Tenant", foreign_keys=[tenant_id])
    
    @property
    def is_overdue(self):
        """Check if maintenance request is overdue"""
        if self.status in [MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED]:
            return False
        
        if self.scheduled_date and self.scheduled_date < datetime.utcnow():
            return True
        
        # Consider urgent items overdue after 24 hours
        if self.priority == MaintenancePriority.URGENT:
            hours_since_created = (datetime.utcnow() - self.created_at).total_seconds() / 3600
            return hours_since_created > 24
        
        return False
    
    @property
    def days_open(self):
        """Get number of days the request has been open"""
        end_date = self.completed_date or datetime.utcnow()
        return (end_date - self.created_at).days
    
    def __repr__(self):
        return f"<MaintenanceRequest(title='{self.title}', status='{self.status}', priority='{self.priority}', id='{self.id}')>"