"""
AI-powered endpoints for property management
"""
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
import asyncio
import logging

from ..services.ai_service import ai_service
from ..models import User, Unit, Property, Tenant
from ..database import get_db
from ..config import settings
from ..services.auth_service import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ai"])


@router.post("/optimize-rent/{unit_id}")
async def optimize_unit_rent(
    unit_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """AI-powered rent optimization for a specific unit"""
    
    # Get unit data
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    # Get market data (simplified for demo)
    market_data = {
        'avg_rent': 1800,
        'vacancy_rate': 5.2,
        'trend': 'increasing',
        'comparables': []
    }
    
    # Get AI optimization
    optimization = await ai_service.optimize_rent_advanced(
        unit_data={
            'market_rent': unit.market_rent,
            'bedrooms': unit.bedrooms,
            'bathrooms': unit.bathrooms,
            'square_feet': unit.square_feet,
            'features': unit.features or [],
            'unit_type': unit.unit_type.value if unit.unit_type else 'apartment'
        },
        market_data=market_data
    )
    
    # Add unit context
    optimization['unit_id'] = unit_id
    optimization['unit_number'] = unit.unit_number
    
    return optimization


@router.post("/analyze-portfolio")
async def analyze_entire_portfolio(db: Session = Depends(get_db)):
    """Comprehensive AI analysis of entire portfolio"""
    
    # Get all properties and units
    properties = db.query(Property).all()
    units = db.query(Unit).all()
    
    # Prepare data for analysis
    properties_data = []
    for property in properties:
        properties_data.append({
            'id': str(property.id),
            'name': property.name,
            'total_units': property.total_units,
            'occupancy_rate': property.occupancy_rate,
            'monthly_revenue': property.monthly_revenue,
            'units': len([u for u in units if u.property_id == property.id])
        })
    
    # Get AI analysis
    analysis = await ai_service.analyze_portfolio(properties_data)
    
    # Add unit-level insights
    unit_optimizations = []
    for unit in units[:5]:  # Top 5 units for demo
        opt = await ai_service.optimize_rent_advanced(
            unit_data={
                'market_rent': unit.market_rent,
                'bedrooms': unit.bedrooms,
                'bathrooms': unit.bathrooms,
                'square_feet': unit.square_feet,
                'features': unit.features or [],
                'unit_type': unit.unit_type.value if unit.unit_type else 'apartment'
            },
            market_data={'avg_rent': 1800}
        )
        opt['unit_id'] = str(unit.id)
        opt['unit_number'] = unit.unit_number
        unit_optimizations.append(opt)
    
    analysis['unit_optimizations'] = unit_optimizations
    
    return analysis


@router.post("/voice-alert")
async def create_voice_alert(
    message: str,
    urgency: str = "normal"
):
    """Generate voice alert for important notifications"""
    
    audio_url = await ai_service.create_voice_notification(message, urgency)
    
    return {
        'audio_url': audio_url,
        'message': message,
        'urgency': urgency,
        'generated_at': 'now'
    }


@router.post("/smart-sms")
async def send_smart_sms(
    phone: str,
    message: str,
    tenant_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Send AI-enhanced SMS"""
    
    tenant_profile = None
    if tenant_id:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        
        if tenant:
            tenant_profile = {
                'payment_history': 'excellent',  # Calculate from payment records
                'comm_preference': 'friendly',
                'tenure_months': 12  # Calculate from lease start
            }
    
    result = await ai_service.send_smart_sms(phone, message, tenant_profile)
    
    return result


@router.post("/predict-maintenance")
async def predict_maintenance_needs(
    property_id: str,
    db: Session = Depends(get_db)
):
    """Predict maintenance needs for a property"""
    
    # Get property and its units
    property = db.query(Property).filter(Property.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Analyze each unit
    predictions = []
    for unit in property.units:
        unit_data = {
            'unit_number': unit.unit_number,
            'year_built': property.year_built,
            'unit_type': unit.unit_type.value if unit.unit_type else 'apartment',
            'square_feet': unit.square_feet,
            'last_maintenance': 'unknown'  # Get from maintenance records
        }
        
        # Get AI prediction (simplified)
        prediction = {
            'urgent_items': [],
            'scheduled_items': ['HVAC filter replacement', 'Annual inspection'],
            'estimated_cost': 500,
            'timeline': '30-60 days'
        }
        
        predictions.append({
            'unit': unit.unit_number,
            'predictions': prediction
        })
    
    return {
        'property': property.name,
        'total_units': len(property.units),
        'units_needing_attention': 1,  # Mock data
        'predictions': predictions,
        'estimated_total_cost': sum(p['predictions'].get('estimated_cost', 0) for p in predictions)
    }


@router.post("/screen-tenant")
async def screen_tenant_application(application_data: Dict):
    """AI-powered tenant screening"""
    
    # Mock screening result - in production, integrate with credit/background check APIs
    screening_result = {
        'risk_score': 25,  # 0-100, lower is better
        'recommendation': 'approve',
        'confidence': 85,
        'factors': {
            'credit_score': application_data.get('credit_score', 700),
            'income_ratio': 3.2,  # Rent to income ratio
            'employment_stability': 'good',
            'rental_history': 'excellent'
        },
        'conditions': [],
        'recommendation_detail': 'Excellent candidate - recommend fast-track approval'
    }
    
    if screening_result['risk_score'] > 60:
        screening_result['conditions'] = ['Additional security deposit', 'Guarantor required']
        screening_result['recommendation_detail'] = 'High risk - require additional security'
    
    return screening_result


@router.post("/generate-listing")
async def generate_listing(
    unit_id: str,
    db: Session = Depends(get_db)
):
    """Generate compelling listing description"""
    
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    listing = await ai_service.generate_listing_description({
        'bedrooms': unit.bedrooms,
        'bathrooms': unit.bathrooms,
        'square_feet': unit.square_feet,
        'features': unit.features or [],
        'unit_type': unit.unit_type.value if unit.unit_type else 'apartment'
    })
    
    # Add unit context
    listing['unit_id'] = unit_id
    listing['unit_number'] = unit.unit_number
    listing['rent'] = unit.market_rent
    
    return listing


@router.post("/analyze-images")
async def analyze_property_images(
    image_urls: List[str],
    property_id: Optional[str] = None
):
    """Analyze property images using AI vision"""
    
    analysis = await ai_service.analyze_property_images(image_urls)
    
    if property_id:
        analysis['property_id'] = property_id
    
    return analysis


@router.post("/predict-churn")
async def predict_tenant_churn(
    tenant_id: str,
    db: Session = Depends(get_db)
):
    """Predict likelihood of tenant leaving"""
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Prepare tenant data
    tenant_data = {
        'payment_punctuality': 'excellent',  # Calculate from payment history
        'maintenance_requests': 2,  # Count from records
        'complaints': 0,  # Count from records
        'lease_end_date': 'in 6 months',  # Calculate from lease
        'tenure_months': 18  # Calculate from move-in date
    }
    
    prediction = await ai_service.predict_tenant_churn(tenant_data)
    
    # Add tenant context
    prediction['tenant_id'] = tenant_id
    prediction['tenant_name'] = tenant.full_name
    
    return prediction


@router.post("/assistant/chat")
async def ai_assistant_chat(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """AI Assistant chat endpoint"""
    message = request.get('message', '')
    context = request.get('context', {})
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Prepare context for AI
    ai_context = f"""
    You are a helpful property management AI assistant. The user is managing:
    - {context.get('properties_count', 0)} properties
    - {context.get('units_count', 0)} units
    Current page: {context.get('current_page', 'unknown')}
    
    Provide helpful, specific advice about property management.
    """
    
    if ai_service.openai_client:
        try:
            response = await ai_service.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": ai_context},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            return {
                "message": response.choices[0].message.content,
                "model": "gpt-3.5-turbo"
            }
            
        except Exception as e:
            logger.error(f"AI chat failed: {str(e)}")
    
    # Fallback responses
    return {
        "message": _get_fallback_assistant_response(message),
        "model": "fallback"
    }


def _get_fallback_assistant_response(message: str) -> str:
    """Generate fallback responses based on keywords"""
    lower_msg = message.lower()
    
    if 'rent' in lower_msg and 'optimize' in lower_msg:
        return "I can analyze your units to find rent optimization opportunities. Units with below-market rents could potentially generate additional revenue. Would you like me to identify specific units?"
    
    if 'maintenance' in lower_msg:
        return "Predictive maintenance can reduce costs by 30%. I can analyze property age, past repairs, and seasonal patterns to forecast upcoming maintenance needs."
    
    if 'tenant' in lower_msg and ('screen' in lower_msg or 'application' in lower_msg):
        return "AI-powered tenant screening evaluates credit scores, income ratios, rental history, and background checks. I score applications from 1-100 to help you make informed decisions."
    
    if 'occupancy' in lower_msg or 'vacancy' in lower_msg:
        return "Maintaining high occupancy is crucial. I can identify at-risk tenants, suggest retention strategies, and optimize your listing descriptions to attract quality tenants faster."
    
    if 'report' in lower_msg or 'analytics' in lower_msg:
        return "I can generate detailed reports on financial performance, occupancy trends, maintenance costs, and tenant satisfaction. Which metrics would you like to analyze?"
    
    return "I'm here to help optimize your property management. I can assist with rent optimization, tenant screening, maintenance predictions, and portfolio analytics. What would you like to know?"


@router.get("/health")
async def ai_health_check():
    """Check AI services health"""
    
    services = {
        'openai': bool(ai_service.openai_client),
        'gemini': bool(ai_service.gemini_model),
        'elevenlabs': bool(settings.ELEVENLABS_API_KEY),
        'twilio': bool(ai_service.twilio_client)
    }
    
    return {
        'status': 'healthy',
        'services_available': services,
        'total_services': sum(services.values()),
        'message': 'AI services are ready for property management automation'
    }


@router.post("/generate-listing")
async def generate_listing(
    request: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate AI-powered property listing"""
    try:
        listing = await ai_service.generate_listing(
            unit=request['unit'],
            property=request['property'],
            custom_details=request.get('custom_details', {}),
            style=request.get('style', 'engaging_seo_optimized')
        )
        
        return {"listing": listing}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/track-listing")
async def track_listing(
    request: dict,
    db: Session = Depends(get_db)
):
    """Track AI listing generation success"""
    # In production, save this to database
    return {"status": "tracked"}


@router.post("/score-application")
async def score_rental_application(
    request: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """AI scores rental application 1-100"""
    try:
        score_data = await ai_service.score_application(request['application'])
        return score_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-lease")
async def generate_smart_lease(
    request: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate AI-powered lease with smart clauses"""
    try:
        lease = await ai_service.generate_smart_lease(
            unit=request['unit'],
            tenant=request['tenant'],
            application=request['application'],
            context=request.get('context', {})
        )
        
        return {"lease": lease}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leasing-assistant/start")
async def start_leasing_conversation(
    request: dict,
    db: Session = Depends(get_db)
):
    """Start a new AI leasing assistant conversation"""
    from ..models.base import BaseModel
    import uuid
    
    conversation_id = str(uuid.uuid4())
    
    # In production, save to database
    # conversation = AIConversation(
    #     id=conversation_id,
    #     type=request['type'],
    #     source=request['source']
    # )
    # db.add(conversation)
    # db.commit()
    
    return {"conversation_id": conversation_id}


@router.post("/leasing-assistant/message")
async def handle_leasing_message(
    request: dict,
    db: Session = Depends(get_db)
):
    """Handle messages in leasing assistant conversation"""
    try:
        response = await ai_service.handle_leasing_conversation(
            conversation_id=request['conversation_id'],
            message=request['message'],
            context=request.get('context', {})
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule-showing")
async def schedule_showing_ai(
    request: dict,
    db: Session = Depends(get_db)
):
    """Use AI to parse natural language showing requests"""
    try:
        result = await ai_service.parse_showing_request(
            request=request['request'],
            unit_id=request.get('unit_id'),
            available_times=request['available_times'],
            agent_calendars=request['agent_calendars']
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations")
async def list_conversations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List all AI conversations for manager view"""
    # In production, fetch from database
    # conversations = db.query(AIConversation).all()
    
    # Mock data for now
    conversations = [
        {
            "id": "conv1",
            "prospect_name": "John Doe",
            "created_at": "2024-01-15T10:30:00",
            "last_message": "I'm interested in the 2BR unit",
            "status": "needs_human",
            "scheduled_showing": False
        },
        {
            "id": "conv2",
            "prospect_name": "Jane Smith",
            "created_at": "2024-01-15T09:15:00",
            "last_message": "Thank you! See you tomorrow at 2pm",
            "status": "scheduled",
            "scheduled_showing": True
        }
    ]
    
    return conversations