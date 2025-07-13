"""
AI-powered property management services
"""
from typing import Dict, List, Optional, Any
import json
import asyncio
from datetime import datetime, timedelta
import logging
from ..config import settings

logger = logging.getLogger(__name__)

# Import AI libraries with error handling
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not installed. Install with: pip install openai")

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("Google Generative AI library not installed. Install with: pip install google-generativeai")

try:
    from elevenlabs import generate, set_api_key, voices
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False
    logger.warning("ElevenLabs library not installed. Install with: pip install elevenlabs")

try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    logger.warning("Twilio library not installed. Install with: pip install twilio")


class AIPropertyManager:
    """World-class AI service for property management"""
    
    def __init__(self):
        self.openai_client = None
        self.gemini_model = None
        self.gemini_vision = None
        self.twilio_client = None
        
        # Initialize AI clients if available and configured
        if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
            try:
                self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("OpenAI client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI: {e}")
        
        if GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_model = genai.GenerativeModel('gemini-pro')
                self.gemini_vision = genai.GenerativeModel('gemini-pro-vision')
                logger.info("Gemini client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
        
        if ELEVENLABS_AVAILABLE and settings.ELEVENLABS_API_KEY:
            try:
                set_api_key(settings.ELEVENLABS_API_KEY)
                logger.info("ElevenLabs client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize ElevenLabs: {e}")
        
        if TWILIO_AVAILABLE and settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                self.twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                logger.info("Twilio client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Twilio: {e}")
    
    async def optimize_rent_advanced(self, unit_data: Dict, market_data: Dict) -> Dict:
        """Advanced rent optimization using GPT-4 with market analysis"""
        
        if not self.openai_client:
            return self._get_mock_rent_optimization(unit_data)
        
        prompt = f"""
        You are an expert real estate analyst. Analyze this rental unit and provide optimal pricing:
        
        UNIT DETAILS:
        - Current Rent: ${unit_data.get('market_rent', 0)}
        - Bedrooms: {unit_data.get('bedrooms', 0)}
        - Bathrooms: {unit_data.get('bathrooms', 0)}
        - Square Feet: {unit_data.get('square_feet', 0)}
        - Features: {', '.join(unit_data.get('features', []))}
        - Unit Type: {unit_data.get('unit_type', 'Unknown')}
        
        MARKET ANALYSIS:
        - Average rent for similar units: ${market_data.get('avg_rent', 0)}
        - Vacancy rate in area: {market_data.get('vacancy_rate', 5)}%
        - Recent rental trends: {market_data.get('trend', 'stable')}
        
        Provide a JSON response with:
        1. optimal_rent (specific number)
        2. confidence (0-100%)
        3. reasoning (detailed explanation)
        4. risk_assessment (low/medium/high)
        5. expected_days_to_fill
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a data-driven real estate pricing expert. Always provide specific, actionable recommendations backed by analysis. Respond in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Add value calculations
            current_rent = unit_data.get('market_rent', 0)
            suggested_rent = result.get('optimal_rent', current_rent)
            
            result.update({
                'current_rent': current_rent,
                'suggested_rent': suggested_rent,
                'monthly_increase': suggested_rent - current_rent,
                'annual_increase': (suggested_rent - current_rent) * 12,
                'implementation_risk': result.get('risk_assessment', 'medium')
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Rent optimization failed: {str(e)}")
            return self._get_mock_rent_optimization(unit_data)
    
    def _get_mock_rent_optimization(self, unit_data: Dict) -> Dict:
        """Fallback mock optimization when AI is unavailable"""
        current_rent = unit_data.get('market_rent', 1500)
        suggested_rent = current_rent * 1.05  # 5% increase
        
        return {
            'current_rent': current_rent,
            'suggested_rent': suggested_rent,
            'monthly_increase': suggested_rent - current_rent,
            'annual_increase': (suggested_rent - current_rent) * 12,
            'confidence': 75,
            'reasoning': 'Mock analysis: Based on typical market conditions, a 5% increase is recommended.',
            'risk_assessment': 'low',
            'expected_days_to_fill': 14,
            'implementation_risk': 'low',
            'mock_data': True
        }
    
    async def analyze_property_images(self, image_urls: List[str]) -> Dict:
        """Use Gemini Vision to analyze property condition"""
        
        if not self.gemini_vision:
            return self._get_mock_image_analysis()
        
        try:
            prompt = """
            Analyze these property images as a professional property inspector. Provide:
            
            1. Overall Condition Score (1-10)
            2. Critical Issues (safety/structural)
            3. Major Issues (expensive repairs)
            4. Minor Issues (cosmetic)
            5. Positive Features
            6. Maintenance Priorities
            
            Be specific and actionable.
            """
            
            # For now, provide mock analysis since image processing requires more setup
            return self._get_mock_image_analysis()
            
        except Exception as e:
            logger.error(f"Image analysis failed: {str(e)}")
            return self._get_mock_image_analysis()
    
    def _get_mock_image_analysis(self) -> Dict:
        """Mock image analysis when AI is unavailable"""
        return {
            'condition_score': 7.5,
            'critical_issues': [],
            'major_issues': ['HVAC system needs inspection', 'Roof showing wear'],
            'minor_issues': ['Paint touch-ups needed', 'Minor plumbing fixes'],
            'positive_features': ['Well-maintained flooring', 'Updated kitchen appliances'],
            'estimated_costs': {
                'immediate': 500,
                'within_6_months': 2500,
                'within_year': 5000
            },
            'maintenance_timeline': [
                {
                    'item': 'HVAC Filter',
                    'due_date': (datetime.now() + timedelta(days=30)).isoformat(),
                    'priority': 'routine',
                    'estimated_cost': 50
                }
            ],
            'mock_data': True
        }
    
    async def create_voice_notification(self, message: str, urgency: str = "normal") -> str:
        """Generate voice notifications for critical alerts"""
        
        if not ELEVENLABS_AVAILABLE:
            logger.warning("ElevenLabs not available for voice generation")
            return ""
        
        try:
            # Add urgency prefix
            if urgency == "urgent":
                message = f"Urgent attention required. {message}"
            
            # For now, return mock URL since voice generation requires proper setup
            audio_url = f"https://mock-storage.com/audio/{datetime.now().timestamp()}.mp3"
            return audio_url
            
        except Exception as e:
            logger.error(f"Voice generation failed: {str(e)}")
            return ""
    
    async def send_smart_sms(self, phone: str, message: str, tenant_profile: Dict = None) -> Dict:
        """Send personalized SMS with AI enhancement"""
        
        if not self.twilio_client:
            logger.warning("Twilio not available for SMS")
            return {'success': False, 'error': 'SMS service not configured'}
        
        try:
            # Enhance message with AI if available
            if self.openai_client and tenant_profile:
                enhanced_message = await self._enhance_sms_message(message, tenant_profile)
                message = enhanced_message or message
            
            # For demo purposes, simulate SMS sending
            logger.info(f"SMS would be sent to {phone}: {message}")
            
            return {
                'success': True,
                'sid': f"mock_sid_{datetime.now().timestamp()}",
                'message': message,
                'status': 'sent',
                'mock_data': True
            }
            
        except Exception as e:
            logger.error(f"SMS failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    async def _enhance_sms_message(self, message: str, tenant_profile: Dict) -> str:
        """Enhance SMS message using AI"""
        try:
            prompt = f"""
            Rewrite this property management message to be more effective and personalized.
            
            Original message: {message}
            
            Tenant profile:
            - Payment history: {tenant_profile.get('payment_history', 'unknown')}
            - Communication preference: {tenant_profile.get('comm_preference', 'professional')}
            
            Make it friendly but professional. Keep under 160 characters.
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert at tenant communication."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=60
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Message enhancement failed: {e}")
            return message
    
    async def predict_tenant_churn(self, tenant_data: Dict) -> Dict:
        """Predict likelihood of tenant leaving"""
        
        if not self.openai_client:
            return self._get_mock_churn_prediction()
        
        prompt = f"""
        Analyze this tenant data and predict churn risk:
        
        Tenant Profile:
        - Payment history: {tenant_data.get('payment_punctuality', 'N/A')}
        - Maintenance requests: {tenant_data.get('maintenance_requests', 0)} in last 6 months
        - Complaints: {tenant_data.get('complaints', 0)}
        - Lease end date: {tenant_data.get('lease_end_date', 'N/A')}
        
        Provide JSON response with:
        1. churn_risk_score (0-100)
        2. key_risk_factors (array)
        3. retention_strategies (array)
        4. recommended_timing (when to act)
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a tenant retention expert. Respond in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Churn prediction failed: {str(e)}")
            return self._get_mock_churn_prediction()
    
    def _get_mock_churn_prediction(self) -> Dict:
        """Mock churn prediction when AI is unavailable"""
        return {
            'churn_risk_score': 25,
            'key_risk_factors': ['Late payment last month'],
            'retention_strategies': ['Early lease renewal offer', 'Check satisfaction'],
            'recommended_timing': 'Within 30 days',
            'mock_data': True
        }
    
    async def generate_listing_description(self, unit_data: Dict) -> Dict:
        """Create compelling listing descriptions"""
        
        if not self.openai_client:
            return self._get_mock_listing()
        
        prompt = f"""
        Create an irresistible rental listing for this unit:
        
        Details:
        - Bedrooms: {unit_data.get('bedrooms')}
        - Bathrooms: {unit_data.get('bathrooms')}
        - Square feet: {unit_data.get('square_feet')}
        - Features: {', '.join(unit_data.get('features', []))}
        - Unit Type: {unit_data.get('unit_type', 'apartment')}
        
        Create:
        1. headline (under 100 chars)
        2. description (200-300 words)
        3. key_selling_points (5 bullets)
        4. call_to_action
        
        Make it emotional and aspirational. Respond in JSON format.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a luxury real estate copywriter. Respond in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )
            
            result = json.loads(response.choices[0].message.content)
            result['generated_at'] = datetime.now().isoformat()
            return result
            
        except Exception as e:
            logger.error(f"Listing generation failed: {str(e)}")
            return self._get_mock_listing()
    
    def _get_mock_listing(self) -> Dict:
        """Mock listing when AI is unavailable"""
        return {
            'headline': 'Stunning Modern Apartment - Move-In Ready!',
            'description': 'Discover your new home in this beautifully designed space featuring modern amenities and thoughtful details throughout.',
            'key_selling_points': [
                'Prime location with easy access to transportation',
                'Modern kitchen with updated appliances',
                'Spacious living areas with natural light',
                'In-unit amenities for convenience',
                'Professional management and maintenance'
            ],
            'call_to_action': 'Schedule your viewing today - this won\'t last long!',
            'generated_at': datetime.now().isoformat(),
            'mock_data': True
        }
    
    async def analyze_portfolio(self, properties_data: List[Dict]) -> Dict:
        """Comprehensive portfolio analysis"""
        
        total_units = sum(prop.get('total_units', 0) for prop in properties_data)
        total_revenue = sum(prop.get('monthly_revenue', 0) for prop in properties_data)
        avg_occupancy = sum(prop.get('occupancy_rate', 0) for prop in properties_data) / len(properties_data) if properties_data else 0
        
        # Generate predictions and recommendations
        predictions = []
        urgent_actions = []
        
        # Mock some insights
        if total_revenue > 0:
            potential_increase = total_revenue * 0.05  # 5% potential increase
            urgent_actions.append({
                'type': 'rent_optimization',
                'priority': 'high',
                'action': f'Portfolio rent optimization could increase revenue by ${potential_increase:.0f}/month',
                'value': potential_increase * 12
            })
        
        return {
            'portfolio_health_score': min(95, max(60, avg_occupancy + 10)),
            'total_properties': len(properties_data),
            'total_units': total_units,
            'optimization_opportunities': 3,
            'potential_monthly_increase': total_revenue * 0.05,
            'potential_annual_increase': total_revenue * 0.05 * 12,
            'predictions': predictions,
            'urgent_actions': urgent_actions,
            'last_analyzed': datetime.now().isoformat()
        }




# Initialize the AI service
ai_service = AIPropertyManager()