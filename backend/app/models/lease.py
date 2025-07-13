"""
Lease model
"""
from sqlalchemy import Column, String, Float, Boolean, Date, ForeignKey, JSON, Enum as SQLEnum, CheckConstraint, Integer
from sqlalchemy.orm import relationship
import enum
from datetime import date

from .base import BaseModel, get_uuid_column


class LeaseStatus(str, enum.Enum):
    """Lease status enumeration"""
    DRAFT = "draft"
    PENDING = "pending"
    ACTIVE = "active"
    EXPIRING = "expiring"
    EXPIRED = "expired"
    TERMINATED = "terminated"


class LeaseType(str, enum.Enum):
    """Lease type enumeration"""
    FIXED_TERM = "fixed_term"
    MONTH_TO_MONTH = "month_to_month"
    SHORT_TERM = "short_term"


class Lease(BaseModel):
    """
    Lease model representing rental agreements
    """
    __tablename__ = "leases"
    __table_args__ = (
        CheckConstraint('end_date > start_date', name='check_end_date_after_start_date'),
        CheckConstraint('rent_amount > 0', name='check_positive_rent'),
        CheckConstraint('deposit_amount >= 0', name='check_non_negative_deposit'),
    )
    
    # Lease Information
    lease_number = Column(String(100), unique=True)
    lease_type = Column(SQLEnum(LeaseType), nullable=False)
    status = Column(SQLEnum(LeaseStatus), default=LeaseStatus.DRAFT, nullable=False)
    
    # Dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    move_in_date = Column(Date)
    move_out_date = Column(Date)
    
    # Financial Terms
    rent_amount = Column(Float, nullable=False)
    deposit_amount = Column(Float, nullable=False)
    deposit_paid = Column(Boolean, default=False)
    deposit_paid_date = Column(Date)
    pet_deposit = Column(Float, default=0)
    
    # Payment Terms
    payment_due_day = Column(Integer, default=1)  # Day of month rent is due
    late_fee_amount = Column(Float, default=0)
    late_fee_grace_days = Column(Integer, default=5)
    
    # Associations
    unit_id = Column(get_uuid_column(), ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(get_uuid_column(), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(get_uuid_column(), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    
    # Additional Occupants
    additional_occupants = Column(JSON, default=list)  # List of names and relationships
    
    # Pets
    pets_allowed = Column(Boolean, default=False)
    pet_details = Column(JSON, default=list)  # List of pet information
    
    # Utilities
    utilities_included = Column(JSON, default=list)  # ["water", "trash", etc.]
    
    # Documents
    signed_lease_url = Column(String)
    documents = Column(JSON, default=list)  # Additional document URLs
    
    # Termination
    termination_date = Column(Date)
    termination_reason = Column(String)
    termination_notes = Column(String)
    
    # Notes
    special_terms = Column(String)
    notes = Column(String)
    
    # Relationships
    unit = relationship("Unit", back_populates="leases")
    tenant = relationship("Tenant", back_populates="leases")
    company = relationship("Company")
    payments = relationship("Payment", back_populates="lease")
    
    @property
    def is_active(self):
        """Check if lease is currently active"""
        today = date.today()
        return (
            self.status == LeaseStatus.ACTIVE and
            self.start_date <= today <= self.end_date
        )
    
    @property
    def days_until_expiry(self):
        """Calculate days until lease expires"""
        if self.end_date:
            return (self.end_date - date.today()).days
        return None
    
    @property
    def total_monthly_amount(self):
        """Calculate total monthly payment including any additional fees"""
        return self.rent_amount + (self.pet_deposit / 12 if self.pets_allowed and self.pet_deposit else 0)
    
    def __repr__(self):
        return f"<Lease(number='{self.lease_number}', status='{self.status}', id='{self.id}')>"