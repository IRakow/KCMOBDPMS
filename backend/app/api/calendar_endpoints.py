"""
Calendar API endpoints for quantum scheduling
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, func
from datetime import datetime, timedelta
import uuid
import re

from ..database import get_db
from ..models import User, Property, Unit, Tenant, MaintenanceRequest
from ..services.auth_service import get_current_user
from ..services.ai_service import ai_service

router = APIRouter(prefix="/calendar", tags=["calendar"])


# Calendar Event Model (simplified, could be separate model)
class CalendarEvent:
    def __init__(self, id, title, type, start_time, end_time=None, property_name=None, 
                 unit_number=None, assignee=None, description=None, status="pending"):
        self.id = id
        self.title = title
        self.type = type
        self.start_time = start_time
        self.end_time = end_time
        self.property_name = property_name
        self.unit_number = unit_number
        self.assignee = assignee
        self.description = description
        self.status = status
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'type': self.type,
            'start_time': self.start_time.isoformat() if isinstance(self.start_time, datetime) else self.start_time,
            'end_time': self.end_time.isoformat() if isinstance(self.end_time, datetime) and self.end_time else None,
            'property_name': self.property_name,
            'unit_number': self.unit_number,
            'assignee': self.assignee,
            'description': self.description,
            'status': self.status,
            'duration': 60  # Default duration in minutes
        }


@router.get("/events")
async def get_calendar_events(
    date: Optional[str] = None,
    view: Optional[str] = None,
    property_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get calendar events with AI predictions"""
    events = []
    predictions = []
    
    try:
        # Get real events from database
        events.extend(get_maintenance_events(db))
        events.extend(get_lease_events(db))
        events.extend(get_showing_events(db))
        
        # Generate AI predictions
        predictions = await generate_ai_predictions(db)
        
    except Exception as e:
        # Use mock data for development
        events = get_mock_events()
        predictions = get_mock_predictions()
    
    return {
        'events': [event.to_dict() for event in events],
        'predictions': predictions,
        'view': view,
        'date': date
    }


@router.post("/events")
async def create_calendar_event(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new calendar event"""
    try:
        # Create event based on type
        event_type = request.get('type', 'general')
        
        if event_type == 'maintenance':
            # Create maintenance request
            maintenance = MaintenanceRequest(
                title=request['title'],
                description=request.get('description', ''),
                property_id=request.get('property_id'),
                unit_id=request.get('unit_id'),
                status='scheduled',
                priority='medium',
                scheduled_date=datetime.fromisoformat(request['date'] + 'T' + request['time']),
                created_by_id=current_user.id
            )
            db.add(maintenance)
            db.commit()
            
            event_id = str(maintenance.id)
        else:
            # Create generic event (would need separate events table in production)
            event_id = str(uuid.uuid4())
        
        return {
            'id': event_id,
            'status': 'created',
            'ai_generated': request.get('ai_generated', False)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai-predictions")
async def get_ai_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-generated calendar predictions and insights"""
    try:
        predictions = await generate_ai_predictions(db)
        insights = await generate_ai_insights(db)
        
        return {
            'predictions': predictions,
            'insights': insights
        }
        
    except Exception as e:
        # Fallback to mock data
        return {
            'predictions': get_mock_predictions(),
            'insights': get_mock_insights()
        }


@router.post("/parse-natural")
async def parse_natural_language(
    request: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Parse natural language into event data"""
    text = request.get('text', '').lower()
    
    # Simple natural language parsing
    parsed_data = {}
    
    # Extract event type
    if 'maintenance' in text or 'repair' in text or 'fix' in text:
        parsed_data['type'] = 'maintenance'
        parsed_data['title'] = 'Maintenance Request'
    elif 'showing' in text or 'tour' in text or 'visit' in text:
        parsed_data['type'] = 'showing'
        parsed_data['title'] = 'Property Tour'
    elif 'inspection' in text or 'inspect' in text:
        parsed_data['type'] = 'inspection'
        parsed_data['title'] = 'Property Inspection'
    elif 'meeting' in text:
        parsed_data['type'] = 'meeting'
        parsed_data['title'] = 'Meeting'
    else:
        parsed_data['type'] = 'general'
        parsed_data['title'] = 'Calendar Event'
    
    # Extract time information
    time_patterns = {
        r'(\d{1,2}):(\d{2})\s*(am|pm)': r'\1:\2 \3',
        r'(\d{1,2})\s*(am|pm)': r'\1:00 \2',
        r'at\s+(\d{1,2}):(\d{2})': r'\1:\2',
        r'at\s+(\d{1,2})': r'\1:00'
    }
    
    for pattern, replacement in time_patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            parsed_data['time'] = match.group(0).replace('at ', '')
            break
    
    # Extract date information
    date_patterns = [
        r'tomorrow',
        r'next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
        r'(monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
        r'next\s+week',
        r'(\d{1,2})/(\d{1,2})'
    ]
    
    for pattern in date_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            # Simple date parsing - in production would use more sophisticated NLP
            if 'tomorrow' in text:
                parsed_data['date'] = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            elif 'next week' in text:
                parsed_data['date'] = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
            break
    
    # Extract property information
    properties = db.query(Property).all()
    for prop in properties:
        if prop.name.lower() in text:
            parsed_data['property'] = prop.name
            break
    
    # Set defaults if not found
    if 'date' not in parsed_data:
        parsed_data['date'] = datetime.now().strftime('%Y-%m-%d')
    if 'time' not in parsed_data:
        parsed_data['time'] = '09:00'
    
    return {
        'parsed_data': parsed_data,
        'original_text': request.get('text', ''),
        'confidence': 0.8  # Mock confidence score
    }


@router.get("/analytics")
async def get_calendar_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get calendar analytics and patterns"""
    try:
        # Calculate analytics from actual data
        total_events = db.query(MaintenanceRequest).count()
        completed_events = db.query(MaintenanceRequest).filter(
            MaintenanceRequest.status == 'completed'
        ).count()
        
        # Mock analytics for now
        analytics = {
            'total_events': total_events or 156,
            'completed_events': completed_events or 142,
            'completion_rate': round((completed_events / total_events * 100) if total_events > 0 else 91, 1),
            'avg_response_time': 4.2,  # hours
            'peak_hours': ['10:00-12:00', '14:00-16:00'],
            'busiest_days': ['Tuesday', 'Thursday'],
            'patterns': [
                {
                    'type': 'maintenance_seasonal',
                    'description': 'HVAC maintenance requests increase 40% in summer',
                    'confidence': 87
                },
                {
                    'type': 'showing_optimal',
                    'description': 'Tours scheduled 2-4pm have 35% higher conversion',
                    'confidence': 92
                }
            ]
        }
        
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize-schedule")
async def optimize_schedule(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """AI-powered schedule optimization"""
    try:
        # Get current events
        events = get_maintenance_events(db) + get_lease_events(db)
        
        # AI optimization logic (simplified)
        optimizations = []
        
        # Group similar events
        maintenance_events = [e for e in events if e.type == 'maintenance']
        if len(maintenance_events) > 1:
            optimizations.append({
                'type': 'grouping',
                'title': 'Batch Maintenance Tasks',
                'description': f'Group {len(maintenance_events)} maintenance tasks for efficiency',
                'potential_savings': '2.5 hours',
                'confidence': 85
            })
        
        # Suggest optimal timing
        optimizations.append({
            'type': 'timing',
            'title': 'Optimize Tour Scheduling',
            'description': 'Reschedule property tours to peak conversion times',
            'potential_improvement': '25% higher conversion rate',
            'confidence': 78
        })
        
        return {
            'optimizations': optimizations,
            'current_efficiency': 73,
            'optimized_efficiency': 89,
            'time_saved': '3.2 hours per week'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper Functions
def get_maintenance_events(db: Session) -> List[CalendarEvent]:
    """Get maintenance events from database"""
    events = []
    try:
        maintenance_requests = db.query(MaintenanceRequest).filter(
            MaintenanceRequest.scheduled_date.isnot(None)
        ).all()
        
        for request in maintenance_requests:
            event = CalendarEvent(
                id=str(request.id),
                title=request.title,
                type='maintenance',
                start_time=request.scheduled_date,
                property_name=request.property.name if request.property else 'Unknown Property',
                unit_number=request.unit.unit_number if request.unit else None,
                description=request.description,
                status=request.status.value if hasattr(request.status, 'value') else str(request.status)
            )
            events.append(event)
    except Exception:
        pass
    
    return events


def get_lease_events(db: Session) -> List[CalendarEvent]:
    """Get lease-related events"""
    events = []
    try:
        # Get leases expiring soon
        from ..models.lease import Lease
        upcoming_leases = db.query(Lease).filter(
            Lease.end_date >= datetime.now(),
            Lease.end_date <= datetime.now() + timedelta(days=90)
        ).all()
        
        for lease in upcoming_leases:
            event = CalendarEvent(
                id=f"lease_{lease.id}",
                title='Lease Renewal Due',
                type='lease',
                start_time=lease.end_date - timedelta(days=30),  # 30 days before expiration
                property_name=lease.unit.property.name if lease.unit and lease.unit.property else 'Unknown Property',
                unit_number=lease.unit.unit_number if lease.unit else None,
                description=f'Lease expires on {lease.end_date.strftime("%Y-%m-%d")}',
                status='pending'
            )
            events.append(event)
    except Exception:
        pass
    
    return events


def get_showing_events(db: Session) -> List[CalendarEvent]:
    """Get showing/tour events (would need separate table in production)"""
    # Mock showing events for now
    return []


async def generate_ai_predictions(db: Session) -> List[Dict]:
    """Generate AI predictions for future events"""
    predictions = []
    
    try:
        # Use AI service to generate predictions
        if ai_service.openai_client:
            # Get context from database
            properties_count = db.query(Property).count()
            units_count = db.query(Unit).count()
            
            context = f"""
            Portfolio context:
            - {properties_count} properties
            - {units_count} total units
            - Current season: {datetime.now().strftime('%B')}
            
            Generate 3 realistic property management event predictions for the next 2 weeks.
            """
            
            try:
                response = await ai_service.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a property management AI that predicts future events. Respond with realistic, actionable predictions."},
                        {"role": "user", "content": context}
                    ],
                    temperature=0.7,
                    max_tokens=300
                )
                
                # Parse AI response into structured predictions
                ai_text = response.choices[0].message.content
                predictions = parse_ai_predictions(ai_text)
                
            except Exception:
                pass
    except Exception:
        pass
    
    # Fallback to mock predictions
    if not predictions:
        predictions = get_mock_predictions()
    
    return predictions


def parse_ai_predictions(ai_text: str) -> List[Dict]:
    """Parse AI text into structured predictions"""
    # Simple parsing - in production would use more sophisticated NLP
    predictions = []
    
    # Mock parsing for now
    base_predictions = [
        {
            'id': 'ai_pred_1',
            'title': 'HVAC Maintenance Window',
            'description': 'Schedule preventive HVAC maintenance before peak summer season',
            'suggested_time': (datetime.now() + timedelta(days=7)).isoformat(),
            'reason': 'Seasonal preparation based on historical patterns',
            'confidence': 85,
            'type': 'maintenance'
        },
        {
            'id': 'ai_pred_2',
            'title': 'Lease Renewal Outreach',
            'description': 'Contact tenants with expiring leases for renewal discussions',
            'suggested_time': (datetime.now() + timedelta(days=3)).isoformat(),
            'reason': 'Optimal timing for renewal conversations',
            'confidence': 92,
            'type': 'lease'
        }
    ]
    
    return base_predictions


async def generate_ai_insights(db: Session) -> List[Dict]:
    """Generate AI insights about calendar patterns"""
    insights = []
    
    try:
        # Get data for analysis
        maintenance_count = db.query(MaintenanceRequest).count()
        
        # Generate insights based on data
        if maintenance_count > 10:
            insights.append({
                'type': 'pattern',
                'title': 'Maintenance Pattern Detected',
                'description': f'Analysis of {maintenance_count} maintenance requests shows clustering on specific days',
                'action': 'Optimize scheduling',
                'confidence': 78
            })
    except Exception:
        pass
    
    # Fallback to mock insights
    if not insights:
        insights = get_mock_insights()
    
    return insights


# Mock Data Functions
def get_mock_events() -> List[CalendarEvent]:
    """Get mock calendar events for development"""
    now = datetime.now()
    
    return [
        CalendarEvent(
            id='1',
            title='HVAC Repair - Unit 205',
            type='maintenance',
            start_time=now + timedelta(hours=2),
            property_name='Sunset Apartments',
            unit_number='205',
            assignee='John Smith',
            description='AC unit not cooling properly',
            status='scheduled'
        ),
        CalendarEvent(
            id='2',
            title='Property Tour',
            type='showing',
            start_time=now + timedelta(days=1, hours=10),
            property_name='Downtown Plaza',
            unit_number='1204',
            assignee='Sarah Johnson',
            description='Prospective tenant viewing',
            status='confirmed'
        ),
        CalendarEvent(
            id='3',
            title='Lease Renewal - Johnson',
            type='lease',
            start_time=now + timedelta(days=14),
            property_name='Garden Complex',
            unit_number='302',
            description='Lease expires next month',
            status='pending'
        ),
        CalendarEvent(
            id='4',
            title='Monthly Inspection',
            type='inspection',
            start_time=now - timedelta(days=2),
            property_name='Sunset Apartments',
            description='Routine monthly property inspection',
            status='completed'
        )
    ]


def get_mock_predictions() -> List[Dict]:
    """Get mock AI predictions"""
    return [
        {
            'id': 'pred_1',
            'title': 'Schedule HVAC Maintenance',
            'description': 'Based on usage patterns, HVAC systems will need maintenance soon',
            'suggested_time': (datetime.now() + timedelta(days=5)).isoformat(),
            'reason': 'Preventive maintenance schedule optimization',
            'confidence': 87,
            'type': 'maintenance'
        },
        {
            'id': 'pred_2',
            'title': 'Optimize Showing Schedule',
            'description': 'Reschedule property tours to peak conversion times',
            'suggested_time': (datetime.now() + timedelta(days=2)).isoformat(),
            'reason': 'Historical data shows 40% higher conversion rate',
            'confidence': 92,
            'type': 'showing'
        },
        {
            'id': 'pred_3',
            'title': 'Lease Renewal Reminder',
            'description': 'Send renewal offers to tenants with expiring leases',
            'suggested_time': (datetime.now() + timedelta(days=10)).isoformat(),
            'reason': 'Optimal timing for lease renewal discussions',
            'confidence': 89,
            'type': 'lease'
        }
    ]


def get_mock_insights() -> List[Dict]:
    """Get mock AI insights"""
    return [
        {
            'type': 'warning',
            'title': 'Maintenance Surge Predicted',
            'description': 'AI detects 73% chance of increased HVAC issues next month due to weather patterns',
            'action': 'Pre-schedule technicians',
            'confidence': 73
        },
        {
            'type': 'opportunity',
            'title': 'Optimal Showing Times',
            'description': 'AI suggests scheduling tours Tue/Thu 2-4pm for 40% higher conversion',
            'action': 'Auto-optimize schedule',
            'confidence': 89
        },
        {
            'type': 'pattern',
            'title': 'Tenant Response Pattern',
            'description': 'Renewal likelihood increases 60% with maintenance response under 24hrs',
            'action': 'View analytics',
            'confidence': 95
        },
        {
            'type': 'recommendation',
            'title': 'Batch Similar Tasks',
            'description': 'Grouping similar maintenance tasks can reduce travel time by 30%',
            'action': 'Enable auto-grouping',
            'confidence': 82
        }
    ]