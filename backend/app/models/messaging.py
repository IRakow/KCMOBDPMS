"""
Messaging models for unified communication hub
"""
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, JSON, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship as db_relationship
from datetime import datetime
import uuid
import enum

from .base import BaseModel


class MessageType(enum.Enum):
    """Types of messages in the system"""
    DIRECT = "direct"
    MAINTENANCE = "maintenance"
    LEASE = "lease"
    PAYMENT = "payment"
    ANNOUNCEMENT = "announcement"
    SYSTEM = "system"


class ParticipantType(enum.Enum):
    """Types of participants in conversations"""
    TENANT = "tenant"
    OWNER = "owner"
    VENDOR = "vendor"
    MANAGER = "manager"
    PROSPECT = "prospect"


class ConversationStatus(enum.Enum):
    """Status of conversations"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    RESOLVED = "resolved"
    PENDING = "pending"


class Conversation(BaseModel):
    """Conversation between participants"""
    __tablename__ = "conversations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(SQLAlchemyEnum(MessageType), default=MessageType.DIRECT)
    status = Column(SQLAlchemyEnum(ConversationStatus), default=ConversationStatus.ACTIVE)
    
    # Participants
    created_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_by = db_relationship("User", foreign_keys=[created_by_id])
    
    # Subject/Topic
    subject = Column(String(255))
    
    # Related entities
    property_id = Column(String(36), ForeignKey("properties.id"))
    property = db_relationship("Property")
    
    unit_id = Column(String(36), ForeignKey("units.id"))
    unit = db_relationship("Unit")
    
    tenant_id = Column(String(36), ForeignKey("tenants.id"))
    tenant = db_relationship("Tenant")
    
    maintenance_request_id = Column(String(36), ForeignKey("maintenance_requests.id"))
    maintenance_request = db_relationship("MaintenanceRequest")
    
    # Metadata
    is_urgent = Column(Boolean, default=False)
    tags = Column(JSON, default=list)
    extra_data = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = db_relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    participants = db_relationship("ConversationParticipant", back_populates="conversation", cascade="all, delete-orphan")
    
    def get_unread_count(self):
        """Get count of unread messages for current user"""
        # This would be calculated based on the current user context
        return sum(1 for msg in self.messages if not msg.is_read)
    
    def get_participant_count(self):
        """Get number of participants"""
        return len(self.participants)
    
    def to_dict(self):
        """Convert to dictionary with computed fields"""
        data = super().to_dict()
        data['unread_count'] = self.unread_count
        data['participant_count'] = self.participant_count
        return data


class ConversationParticipant(BaseModel):
    """Participants in a conversation"""
    __tablename__ = "conversation_participants"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    conversation = db_relationship("Conversation", back_populates="participants")
    
    # Participant info
    user_id = Column(String(36), ForeignKey("users.id"))
    user = db_relationship("User")
    
    participant_type = Column(SQLAlchemyEnum(ParticipantType), nullable=False)
    participant_name = Column(String(255), nullable=False)
    participant_email = Column(String(255))
    participant_phone = Column(String(50))
    
    # Permissions
    can_reply = Column(Boolean, default=True)
    can_add_participants = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    
    # Status
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    left_at = Column(DateTime)
    last_read_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Notifications
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    push_notifications = Column(Boolean, default=True)


class Message(BaseModel):
    """Individual messages in conversations"""
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    conversation = db_relationship("Conversation", back_populates="messages")
    
    # Sender
    sender_id = Column(String(36), ForeignKey("users.id"))
    sender = db_relationship("User")
    sender_name = Column(String(255), nullable=False)
    sender_type = Column(SQLAlchemyEnum(ParticipantType))
    
    # Content
    content = Column(Text, nullable=False)
    content_type = Column(String(50), default="text")  # text, image, file, system
    
    # Metadata
    extra_data = Column(JSON, default=dict)  # For storing file info, image URLs, etc.
    
    # Status
    is_read = Column(Boolean, default=False)
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    edited_at = Column(DateTime)
    read_at = Column(DateTime)
    
    # Attachments relationship
    attachments = db_relationship("MessageAttachment", back_populates="message", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'conversation_id': str(self.conversation_id),
            'sender_id': str(self.sender_id) if self.sender_id else None,
            'sender_name': self.sender_name,
            'sender_type': self.sender_type.value if self.sender_type else None,
            'content': self.content,
            'content_type': self.content_type,
            'is_read': self.is_read,
            'is_edited': self.is_edited,
            'is_deleted': self.is_deleted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'edited_at': self.edited_at.isoformat() if self.edited_at else None,
            'attachments': [att.to_dict() for att in self.attachments],
            'is_from_me': False  # This would be set based on current user context
        }


class MessageAttachment(BaseModel):
    """Attachments for messages"""
    __tablename__ = "message_attachments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String(36), ForeignKey("messages.id"), nullable=False)
    message = db_relationship("Message", back_populates="attachments")
    
    # File info
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(100))
    file_size = Column(Integer)  # Size in bytes
    file_url = Column(String(500), nullable=False)
    
    # Metadata
    mime_type = Column(String(100))
    thumbnail_url = Column(String(500))
    extra_data = Column(JSON, default=dict)
    
    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'file_name': self.file_name,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'file_url': self.file_url,
            'mime_type': self.mime_type,
            'thumbnail_url': self.thumbnail_url,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }


class MessageTemplate(BaseModel):
    """Reusable message templates"""
    __tablename__ = "message_templates"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Template info
    name = Column(String(255), nullable=False)
    category = Column(String(100))  # maintenance, payment, general, etc.
    subject = Column(String(255))
    content = Column(Text, nullable=False)
    
    # Variables that can be replaced
    variables = Column(JSON, default=list)  # ['tenant_name', 'unit_number', etc.]
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime)
    
    # Ownership
    created_by_id = Column(String(36), ForeignKey("users.id"))
    created_by = db_relationship("User")
    is_public = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)