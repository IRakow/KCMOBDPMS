"""
Unit model
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
import enum

from .base import BaseModel, get_uuid_column


class UnitStatus(str, enum.Enum):
    """Unit status enumeration"""
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"
    RESERVED = "reserved"
    NOT_READY = "not_ready"


class UnitType(str, enum.Enum):
    """Unit type enumeration"""
    STUDIO = "studio"
    ONE_BEDROOM = "1_bedroom"
    TWO_BEDROOM = "2_bedroom"
    THREE_BEDROOM = "3_bedroom"
    FOUR_BEDROOM = "4_bedroom"
    PENTHOUSE = "penthouse"
    COMMERCIAL = "commercial"
    OTHER = "other"


class Unit(BaseModel):
    """
    Unit model representing individual rental units within a property
    """
    __tablename__ = "units"
    
    # Basic Information
    unit_number = Column(String(50), nullable=False)
    unit_type = Column(SQLEnum(UnitType), nullable=False)
    floor = Column(Integer)
    
    # Status
    status = Column(SQLEnum(UnitStatus), default=UnitStatus.AVAILABLE, nullable=False)
    is_furnished = Column(Boolean, default=False)
    
    # Measurements
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Float, default=1.0)  # Allows for half bathrooms
    square_feet = Column(Float)
    
    # Financial
    market_rent = Column(Float, nullable=False)
    deposit_amount = Column(Float)
    
    # Property Association
    property_id = Column(get_uuid_column(), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    
    # Features
    features = Column(JSON, default=list)  # ["balcony", "washer_dryer", "dishwasher", etc.]
    utilities_included = Column(JSON, default=list)  # ["water", "trash", "gas", etc.]
    
    # Notes
    notes = Column(String)
    
    # Media
    images = Column(JSON, default=list)  # List of image URLs
    floor_plan_url = Column(String)
    
    # Relationships
    property_ref = relationship("Property", back_populates="units")
    leases = relationship("Lease", back_populates="unit")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="unit")
    
    @property
    def is_occupied(self):
        """Check if unit is currently occupied"""
        return self.status == UnitStatus.OCCUPIED
    
    @property
    def is_available(self):
        """Check if unit is available for rent"""
        return self.status == UnitStatus.AVAILABLE
    
    @property
    def current_tenant(self):
        """Get current tenant if unit is occupied"""
        # Find active lease
        for lease in self.leases:
            if lease.status == 'active':
                return lease.tenant
        return None
    
    @property
    def property(self):
        """Alias for property_ref to maintain compatibility"""
        return self.property_ref
    
    def __repr__(self):
        return f"<Unit(number='{self.unit_number}', type='{self.unit_type}', status='{self.status}', id='{self.id}')>"