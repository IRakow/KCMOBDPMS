"""
Models package - exports all database models
"""
from .base import BaseModel
from .company import Company
from .user import User, UserRole
from .property import Property, PropertyType, user_property_assignments
from .unit import Unit, UnitStatus, UnitType
from .tenant import Tenant, TenantStatus
from .lease import Lease, LeaseStatus, LeaseType
from .payment import Payment, PaymentStatus, PaymentType
from .maintenance import MaintenanceRequest, MaintenanceStatus, MaintenancePriority
from .messaging import (
    Conversation, ConversationParticipant, Message, MessageAttachment, MessageTemplate,
    MessageType, ParticipantType, ConversationStatus
)

__all__ = [
    # Base
    "BaseModel",
    
    # Company
    "Company",
    
    # User
    "User",
    "UserRole",
    
    # Property
    "Property",
    "PropertyType",
    "user_property_assignments",
    
    # Unit
    "Unit",
    "UnitStatus",
    "UnitType",
    
    # Tenant
    "Tenant",
    "TenantStatus",
    
    # Lease
    "Lease",
    "LeaseStatus",
    "LeaseType",
    
    # Payment
    "Payment",
    "PaymentStatus",
    "PaymentType",
    
    # Maintenance
    "MaintenanceRequest",
    "MaintenanceStatus",
    "MaintenancePriority",
    
    # Messaging
    "Conversation",
    "ConversationParticipant",
    "Message",
    "MessageAttachment",
    "MessageTemplate",
    "MessageType",
    "ParticipantType",
    "ConversationStatus",
]