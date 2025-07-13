"""
Tenant model
"""
from sqlalchemy import Column, String, Boolean, Date, JSON, Enum as SQLEnum, ForeignKey, Float, Integer
from sqlalchemy.orm import relationship
import enum

from .base import BaseModel, get_uuid_column


class TenantStatus(str, enum.Enum):
    """Tenant status enumeration"""
    APPLICANT = "applicant"
    APPROVED = "approved"
    ACTIVE = "active"
    PAST = "past"
    BLACKLISTED = "blacklisted"


class Tenant(BaseModel):
    """
    Tenant model representing renters
    """
    __tablename__ = "tenants"
    
    # Personal Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    date_of_birth = Column(Date)
    
    # Identification
    ssn_last_four = Column(String(4))  # Store only last 4 digits for security
    drivers_license = Column(String(50))
    
    # Status
    status = Column(SQLEnum(TenantStatus), default=TenantStatus.APPLICANT, nullable=False)
    
    # Emergency Contact
    emergency_contact_name = Column(String(200))
    emergency_contact_phone = Column(String(50))
    emergency_contact_relationship = Column(String(100))
    
    # Employment Information
    employer_name = Column(String(255))
    employer_phone = Column(String(50))
    job_title = Column(String(200))
    monthly_income = Column(Float)
    employment_start_date = Column(Date)
    
    # Background Check
    background_check_completed = Column(Boolean, default=False)
    background_check_date = Column(Date)
    background_check_notes = Column(String)
    credit_score = Column(Integer)
    
    # References
    references = Column(JSON, default=list)  # List of reference objects
    
    # Previous Rental History
    previous_landlord_name = Column(String(200))
    previous_landlord_phone = Column(String(50))
    previous_address = Column(String(500))
    previous_rent_amount = Column(Float)
    
    # Company Association
    company_id = Column(get_uuid_column(), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    
    # Documents
    documents = Column(JSON, default=list)  # List of document URLs
    
    # Notes
    notes = Column(String)
    
    # Relationships
    company = relationship("Company")
    leases = relationship("Lease", back_populates="tenant")
    payments = relationship("Payment", back_populates="tenant")
    current_lease = relationship(
        "Lease",
        primaryjoin="and_(Tenant.id==Lease.tenant_id, Lease.status=='active')",
        uselist=False,
        viewonly=True
    )
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_active_tenant(self):
        return self.status == TenantStatus.ACTIVE and self.current_lease is not None
    
    def __repr__(self):
        return f"<Tenant(name='{self.full_name}', status='{self.status}', id='{self.id}')>"