"""
Messaging API endpoints for unified communication hub
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc
from datetime import datetime
import uuid

from ..database import get_db
from ..models import (
    User, Conversation, ConversationParticipant, Message, MessageAttachment,
    MessageTemplate, MessageType, ParticipantType, ConversationStatus,
    Property, Unit, Tenant, MaintenanceRequest
)
from ..services.auth_service import get_current_user
from ..services.notification_service import NotificationService

router = APIRouter(prefix="/messaging", tags=["messaging"])

# Initialize notification service
notification_service = NotificationService()


@router.get("/conversations")
async def list_conversations(
    type: Optional[str] = None,
    status: Optional[str] = Query(None, description="Filter by status: active, archived, resolved"),
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of conversations for current user"""
    query = db.query(Conversation).join(
        ConversationParticipant,
        Conversation.id == ConversationParticipant.conversation_id
    ).filter(
        ConversationParticipant.user_id == current_user.id,
        ConversationParticipant.is_active == True
    )
    
    # Apply filters
    if type and type != 'all':
        if type == 'unread':
            # Get conversations with unread messages
            query = query.join(Message).filter(
                Message.is_read == False,
                Message.sender_id != current_user.id
            ).distinct()
        elif type == 'tenants':
            query = query.filter(
                ConversationParticipant.participant_type == ParticipantType.TENANT
            )
        elif type == 'owners':
            query = query.filter(
                ConversationParticipant.participant_type == ParticipantType.OWNER
            )
        elif type == 'vendors':
            query = query.filter(
                ConversationParticipant.participant_type == ParticipantType.VENDOR
            )
    
    if status:
        try:
            status_enum = ConversationStatus(status)
            query = query.filter(Conversation.status == status_enum)
        except ValueError:
            pass
    
    # Order by last message time
    query = query.order_by(desc(Conversation.last_message_at))
    
    # Execute query
    conversations = query.offset(offset).limit(limit).all()
    
    # Format response
    result = []
    for conv in conversations:
        # Get last message
        last_message = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.is_deleted == False
        ).order_by(desc(Message.created_at)).first()
        
        # Get primary participant (not current user)
        participant = db.query(ConversationParticipant).filter(
            ConversationParticipant.conversation_id == conv.id,
            ConversationParticipant.user_id != current_user.id
        ).first()
        
        if not participant:
            # If no other participant, get current user as participant
            participant = db.query(ConversationParticipant).filter(
                ConversationParticipant.conversation_id == conv.id,
                ConversationParticipant.user_id == current_user.id
            ).first()
        
        # Count unread messages
        unread_count = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user.id,
            Message.is_read == False
        ).count()
        
        result.append({
            'id': str(conv.id),
            'participant_name': participant.participant_name if participant else 'Unknown',
            'participant_type': participant.participant_type.value if participant else None,
            'participant_avatar': None,  # Would be fetched from user profile
            'property_name': conv.property.name if conv.property else 'Multiple Properties',
            'unit_number': conv.unit.unit_number if conv.unit else None,
            'last_message': {
                'content': last_message.content if last_message else '',
                'created_at': last_message.created_at.isoformat() if last_message else conv.created_at.isoformat(),
                'is_from_me': last_message.sender_id == current_user.id if last_message else False
            },
            'unread_count': unread_count,
            'urgent': conv.is_urgent,
            'linked_ticket': {
                'type': 'maintenance'
            } if conv.maintenance_request_id else None
        })
    
    return {
        'conversations': result,
        'total': query.count(),
        'limit': limit,
        'offset': offset
    }


@router.post("/conversations")
async def create_conversation(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new conversation"""
    # Create conversation
    conversation = Conversation(
        type=MessageType.DIRECT,
        created_by_id=current_user.id,
        subject=request.get('subject'),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        last_message_at=datetime.utcnow()
    )
    
    # Link to property/unit if provided
    if request.get('property_id'):
        conversation.property_id = request['property_id']
    if request.get('unit_id'):
        conversation.unit_id = request['unit_id']
    
    db.add(conversation)
    db.flush()
    
    # Add current user as participant
    current_participant = ConversationParticipant(
        conversation_id=conversation.id,
        user_id=current_user.id,
        participant_type=ParticipantType.MANAGER,
        participant_name=f"{current_user.first_name} {current_user.last_name}",
        participant_email=current_user.email,
        is_admin=True
    )
    db.add(current_participant)
    
    # Add recipient
    recipient_type = ParticipantType(request.get('recipient_type', 'tenant'))
    recipient = ConversationParticipant(
        conversation_id=conversation.id,
        participant_type=recipient_type,
        participant_name=request['recipient'],
        participant_email=request.get('recipient_email')
    )
    
    # Try to find user by name/email
    if request.get('recipient_email'):
        user = db.query(User).filter(User.email == request['recipient_email']).first()
        if user:
            recipient.user_id = user.id
    
    db.add(recipient)
    
    # Create initial message
    if request.get('message'):
        message = Message(
            conversation_id=conversation.id,
            sender_id=current_user.id,
            sender_name=f"{current_user.first_name} {current_user.last_name}",
            sender_type=ParticipantType.MANAGER,
            content=request['message'],
            created_at=datetime.utcnow()
        )
        db.add(message)
        
        # Schedule notification
        background_tasks.add_task(
            notification_service.send_message_notification,
            recipient.user_id if recipient.user_id else None,
            message
        )
    
    db.commit()
    
    return {
        'id': str(conversation.id),
        'status': 'created'
    }


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get conversation details"""
    # Verify user has access
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id,
        ConversationParticipant.is_active == True
    ).first()
    
    if not participant:
        raise HTTPException(status_code=403, detail="Access denied")
    
    conversation = db.query(Conversation).options(
        joinedload(Conversation.property),
        joinedload(Conversation.unit),
        joinedload(Conversation.tenant)
    ).filter(Conversation.id == conversation_id).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get participants
    participants = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.is_active == True
    ).all()
    
    return {
        'id': str(conversation.id),
        'type': conversation.type.value,
        'status': conversation.status.value,
        'subject': conversation.subject,
        'is_urgent': conversation.is_urgent,
        'property': conversation.property.to_dict() if conversation.property else None,
        'unit': conversation.unit.to_dict() if conversation.unit else None,
        'participants': [
            {
                'id': str(p.id),
                'name': p.participant_name,
                'type': p.participant_type.value,
                'email': p.participant_email,
                'is_admin': p.is_admin
            } for p in participants
        ],
        'created_at': conversation.created_at.isoformat()
    }


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get messages in a conversation"""
    # Verify user has access
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id,
        ConversationParticipant.is_active == True
    ).first()
    
    if not participant:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.is_deleted == False
    ).order_by(desc(Message.created_at)).offset(offset).limit(limit).all()
    
    # Mark messages as read
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).update({'is_read': True, 'read_at': datetime.utcnow()})
    
    # Update participant's last read time
    participant.last_read_at = datetime.utcnow()
    
    db.commit()
    
    # Format messages
    result = []
    for msg in reversed(messages):  # Reverse to show oldest first
        msg_dict = msg.to_dict()
        msg_dict['is_from_me'] = msg.sender_id == current_user.id
        result.append(msg_dict)
    
    return {
        'messages': result,
        'total': db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.is_deleted == False
        ).count(),
        'limit': limit,
        'offset': offset
    }


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message in a conversation"""
    # Verify user has access and can reply
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id,
        ConversationParticipant.is_active == True
    ).first()
    
    if not participant or not participant.can_reply:
        raise HTTPException(status_code=403, detail="Cannot send messages in this conversation")
    
    # Create message
    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        sender_name=f"{current_user.first_name} {current_user.last_name}",
        sender_type=participant.participant_type,
        content=request['content'],
        content_type=request.get('content_type', 'text'),
        created_at=datetime.utcnow()
    )
    
    db.add(message)
    
    # Update conversation last message time
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    conversation.last_message_at = datetime.utcnow()
    conversation.updated_at = datetime.utcnow()
    
    # Get other participants for notifications
    other_participants = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id != current_user.id,
        ConversationParticipant.is_active == True
    ).all()
    
    db.commit()
    
    # Send notifications
    for participant in other_participants:
        if participant.user_id:
            background_tasks.add_task(
                notification_service.send_message_notification,
                participant.user_id,
                message
            )
    
    return {
        'id': str(message.id),
        'status': 'sent'
    }


@router.post("/conversations/{conversation_id}/mark-read")
async def mark_conversation_read(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all messages in conversation as read"""
    # Verify user has access
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id,
        ConversationParticipant.is_active == True
    ).first()
    
    if not participant:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Mark messages as read
    updated = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).update({'is_read': True, 'read_at': datetime.utcnow()})
    
    # Update participant's last read time
    participant.last_read_at = datetime.utcnow()
    
    db.commit()
    
    return {
        'messages_marked': updated
    }


@router.put("/conversations/{conversation_id}/archive")
async def archive_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Archive a conversation"""
    # Verify user has access
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id,
        ConversationParticipant.is_active == True
    ).first()
    
    if not participant:
        raise HTTPException(status_code=403, detail="Access denied")
    
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.status = ConversationStatus.ARCHIVED
    conversation.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        'status': 'archived'
    }


@router.get("/templates")
async def list_message_templates(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get message templates"""
    query = db.query(MessageTemplate).filter(
        or_(
            MessageTemplate.created_by_id == current_user.id,
            MessageTemplate.is_public == True
        )
    )
    
    if category:
        query = query.filter(MessageTemplate.category == category)
    
    templates = query.order_by(desc(MessageTemplate.usage_count)).all()
    
    return {
        'templates': [
            {
                'id': str(t.id),
                'name': t.name,
                'category': t.category,
                'subject': t.subject,
                'content': t.content,
                'variables': t.variables,
                'usage_count': t.usage_count
            } for t in templates
        ]
    }


@router.post("/templates")
async def create_message_template(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a message template"""
    template = MessageTemplate(
        name=request['name'],
        category=request.get('category'),
        subject=request.get('subject'),
        content=request['content'],
        variables=request.get('variables', []),
        created_by_id=current_user.id,
        is_public=request.get('is_public', False),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(template)
    db.commit()
    
    return {
        'id': str(template.id),
        'status': 'created'
    }


@router.get("/search")
async def search_messages(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search messages across conversations"""
    # Get conversations user has access to
    user_conversations = db.query(ConversationParticipant.conversation_id).filter(
        ConversationParticipant.user_id == current_user.id,
        ConversationParticipant.is_active == True
    ).subquery()
    
    # Search messages
    messages = db.query(Message).filter(
        Message.conversation_id.in_(user_conversations),
        Message.content.ilike(f"%{q}%"),
        Message.is_deleted == False
    ).order_by(desc(Message.created_at)).limit(limit).all()
    
    # Format results
    results = []
    for msg in messages:
        conversation = db.query(Conversation).filter(
            Conversation.id == msg.conversation_id
        ).first()
        
        results.append({
            'message_id': str(msg.id),
            'conversation_id': str(msg.conversation_id),
            'content': msg.content,
            'sender_name': msg.sender_name,
            'created_at': msg.created_at.isoformat(),
            'conversation_subject': conversation.subject if conversation else None
        })
    
    return {
        'results': results,
        'query': q
    }


# Notification service placeholder
class NotificationService:
    """Placeholder for notification service"""
    
    async def send_message_notification(self, user_id: str, message: Message):
        """Send notification about new message"""
        # In production, this would:
        # 1. Send push notification
        # 2. Send email if enabled
        # 3. Send SMS if enabled
        print(f"Notification sent to user {user_id} about message {message.id}")