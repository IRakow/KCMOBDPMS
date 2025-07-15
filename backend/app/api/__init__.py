from fastapi import APIRouter
from .properties import router as properties_router
from .dashboard import router as dashboard_router
from .auth import router as auth_router
from .units import router as units_router
from .ai_endpoints import router as ai_router
from .leases import router as leases_router
from .messaging_endpoints import router as messaging_router
from .calendar_endpoints import router as calendar_router

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(properties_router, prefix="/properties", tags=["properties"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(units_router, prefix="/units", tags=["units"])
api_router.include_router(ai_router, prefix="/ai", tags=["ai"])
api_router.include_router(leases_router, prefix="/leases", tags=["leases"])
api_router.include_router(messaging_router, tags=["messaging"])
api_router.include_router(calendar_router, tags=["calendar"])

# Add more routers as they are created