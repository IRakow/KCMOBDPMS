"""
Payment model
"""
from sqlalchemy import Column, String, Float, Date, Enum, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
import enum
from datetime import date

from .base import BaseModel, get_uuid_column


class PaymentStatus(str, enum.Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentType(str, enum.Enum):
    """Payment type enumeration"""
    RENT = "rent"
    DEPOSIT = "deposit"
    PET_DEPOSIT = "pet_deposit"
    LATE_FEE = "late_fee"
    UTILITY = "utility"
    MAINTENANCE = "maintenance"
    OTHER = "other"


class PaymentMethod(str, enum.Enum):
    """Payment method enumeration"""
    CASH = "cash"
    CHECK = "check"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    ACH = "ach"
    BANK_TRANSFER = "bank_transfer"
    ONLINE = "online"
    OTHER = "other"


class Payment(BaseModel):
    """
    Payment model representing tenant payments
    """
    __tablename__ = "payments"
    
    # Payment Information
    amount = Column(Float, nullable=False)
    payment_date = Column(Date, nullable=False)
    payment_type = Column(Enum(PaymentType), default=PaymentType.RENT, nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    # Transaction Details
    transaction_id = Column(String(255))  # From payment processor
    reference_number = Column(String(255))  # Check number, confirmation code, etc.
    
    # Associations
    lease_id = Column(get_uuid_column(), ForeignKey("leases.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(get_uuid_column(), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Processing Details
    processed_date = Column(Date)
    processor_fee = Column(Float, default=0)
    
    # Notes and Description
    description = Column(String(500))
    notes = Column(Text)
    
    # Late Payment Information
    is_late = Column(Boolean, default=False)
    late_fee_amount = Column(Float, default=0)
    
    # Refund Information
    refund_amount = Column(Float, default=0)
    refund_date = Column(Date)
    refund_reason = Column(String(500))
    
    # Relationships
    lease = relationship("Lease", back_populates="payments")
    tenant = relationship("Tenant", back_populates="payments")
    
    @property
    def net_amount(self):
        """Calculate net amount after processor fees"""
        return self.amount - (self.processor_fee or 0)
    
    @property
    def is_rent_payment(self):
        """Check if this is a rent payment"""
        return self.payment_type == PaymentType.RENT
    
    @property
    def days_late(self):
        """Calculate how many days late this payment was"""
        if not self.is_late or not self.lease:
            return 0
        
        # Assuming rent is due on the payment_due_day of each month
        due_date = date(self.payment_date.year, self.payment_date.month, self.lease.payment_due_day)
        if self.payment_date > due_date:
            return (self.payment_date - due_date).days
        return 0
    
    def __repr__(self):
        return f"<Payment(amount=${self.amount}, type='{self.payment_type}', status='{self.status}', id='{self.id}')>"