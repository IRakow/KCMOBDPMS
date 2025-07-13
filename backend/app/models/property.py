"""
Property model
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, JSON, Enum as SQLEnum, Table, DateTime
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

from .base import BaseModel, get_uuid_column
from ..database import Base


# Association table for many-to-many relationship between users and properties
user_property_assignments = Table(
    'user_property_assignments',
    Base.metadata,
    Column('user_id', get_uuid_column(), ForeignKey('users.id', ondelete='CASCADE')),
    Column('property_id', get_uuid_column(), ForeignKey('properties.id', ondelete='CASCADE')),
    Column('assigned_at', DateTime, default=datetime.utcnow)
)


class PropertyType(str, enum.Enum):
    """Property type enumeration"""
    SINGLE_FAMILY = "single_family"
    MULTI_FAMILY = "multi_family"
    APARTMENT = "apartment"
    CONDO = "condo"
    TOWNHOUSE = "townhouse"
    COMMERCIAL = "commercial"
    MIXED_USE = "mixed_use"
    OTHER = "other"


class Property(BaseModel):
    """
    Property model representing real estate properties
    """
    __tablename__ = "properties"
    
    # Basic Information
    name = Column(String(255), nullable=False)
    property_type = Column(SQLEnum(PropertyType), nullable=False)
    description = Column(String)
    
    # Address
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255))
    city = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), default="United States")
    
    # Property Details
    year_built = Column(Integer)
    total_units = Column(Integer, default=1)
    total_square_feet = Column(Float)
    lot_size = Column(Float)
    
    # Financial Information
    purchase_price = Column(Float)
    purchase_date = Column(DateTime)
    current_value = Column(Float)
    monthly_operating_expenses = Column(Float, default=0)
    property_tax_annual = Column(Float, default=0)
    insurance_annual = Column(Float, default=0)
    
    # Management
    company_id = Column(get_uuid_column(), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Features and Amenities
    features = Column(JSON, default=list)  # ["parking", "gym", "pool", etc.]
    amenities = Column(JSON, default=dict)  # {"parking_spots": 2, "storage_units": 1, etc.}
    
    # Media
    images = Column(JSON, default=list)  # List of image URLs
    documents = Column(JSON, default=list)  # List of document URLs
    
    # Relationships
    company = relationship("Company", back_populates="properties")
    units = relationship("Unit", back_populates="property_ref", cascade="all, delete-orphan")
    assigned_users = relationship(
        "User",
        secondary=user_property_assignments,
        back_populates="assigned_properties"
    )
    
    @property
    def full_address(self):
        """Get formatted full address"""
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.append(f"{self.city}, {self.state} {self.postal_code}")
        return ", ".join(parts)
    
    @property
    def occupancy_rate(self):
        """Calculate current occupancy rate"""
        if not self.units or self.total_units == 0:
            return 0.0
        
        occupied_units = sum(1 for unit in self.units if unit.is_occupied)
        return (occupied_units / self.total_units) * 100
    
    @property
    def monthly_revenue(self):
        """Calculate total monthly revenue from all units"""
        if not self.units:
            return 0.0
        return sum(unit.market_rent or 0 for unit in self.units if unit.is_occupied)
    
    @property
    def annual_revenue(self):
        """Calculate projected annual revenue"""
        return self.monthly_revenue * 12
    
    @property
    def net_operating_income(self):
        """Calculate monthly NOI (Net Operating Income)"""
        return self.monthly_revenue - (self.monthly_operating_expenses or 0)
    
    @property
    def vacant_units(self):
        """Get count of vacant units"""
        if not self.units:
            return self.total_units
        return sum(1 for unit in self.units if not unit.is_occupied)
    
    def __repr__(self):
        return f"<Property(name='{self.name}', type='{self.property_type}', id='{self.id}')>"