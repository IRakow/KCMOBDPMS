"""
Property API endpoints
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from pydantic import BaseModel, Field
from datetime import datetime

from ..database import get_db
from ..models import Property, PropertyType, Unit, User
from ..config import settings


router = APIRouter()


# Pydantic schemas
class PropertyBase(BaseModel):
    name: str
    property_type: PropertyType
    description: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "United States"
    year_built: Optional[int] = None
    total_units: int = 1
    total_square_feet: Optional[float] = None
    lot_size: Optional[float] = None
    purchase_price: Optional[float] = None
    purchase_date: Optional[datetime] = None
    current_value: Optional[float] = None
    features: List[str] = []
    amenities: dict = {}


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    property_type: Optional[PropertyType] = None
    description: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    year_built: Optional[int] = None
    total_units: Optional[int] = None
    total_square_feet: Optional[float] = None
    lot_size: Optional[float] = None
    purchase_price: Optional[float] = None
    purchase_date: Optional[datetime] = None
    current_value: Optional[float] = None
    features: Optional[List[str]] = None
    amenities: Optional[dict] = None
    is_active: Optional[bool] = None


class PropertyResponse(PropertyBase):
    id: UUID
    company_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    occupancy_rate: float
    full_address: str
    
    class Config:
        from_attributes = True


class PropertyListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[PropertyResponse]


# API Endpoints
@router.get("/", response_model=PropertyListResponse)
async def list_properties(
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    property_type: Optional[PropertyType] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    List properties with pagination and filtering
    """
    # Build query
    query = db.query(Property)
    
    # Apply filters
    filters = []
    
    # TODO: Add company filter based on current user
    # filters.append(Property.company_id == current_user.company_id)
    
    if property_type:
        filters.append(Property.property_type == property_type)
    
    if city:
        filters.append(Property.city.ilike(f"%{city}%"))
    
    if state:
        filters.append(Property.state.ilike(f"%{state}%"))
    
    if is_active is not None:
        filters.append(Property.is_active == is_active)
    
    if search:
        search_filter = or_(
            Property.name.ilike(f"%{search}%"),
            Property.address_line1.ilike(f"%{search}%"),
            Property.city.ilike(f"%{search}%"),
        )
        filters.append(search_filter)
    
    if filters:
        query = query.filter(and_(*filters))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    properties = query.offset(offset).limit(page_size).all()
    
    return PropertyListResponse(
        total=total,
        page=page,
        page_size=page_size,
        results=properties
    )


@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Create a new property
    """
    # TODO: Check user permissions
    # if not current_user.has_permission("property:create"):
    #     raise HTTPException(status_code=403, detail="Not authorized to create properties")
    
    # Create property
    property = Property(
        **property_data.dict(),
        # company_id=current_user.company_id  # TODO: Set from current user
        company_id=UUID("123e4567-e89b-12d3-a456-426614174000")  # Placeholder
    )
    
    db.add(property)
    db.commit()
    db.refresh(property)
    
    return property


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: UUID,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Get a single property by ID
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        # Property.company_id == current_user.company_id  # TODO: Add company filter
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    return property


@router.patch("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: UUID,
    property_update: PropertyUpdate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Update a property
    """
    # TODO: Check user permissions
    # if not current_user.has_permission("property:update"):
    #     raise HTTPException(status_code=403, detail="Not authorized to update properties")
    
    property = db.query(Property).filter(
        Property.id == property_id,
        # Property.company_id == current_user.company_id  # TODO: Add company filter
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Update fields
    update_data = property_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property, field, value)
    
    db.commit()
    db.refresh(property)
    
    return property


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: UUID,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Delete a property (soft delete by setting is_active to False)
    """
    # TODO: Check user permissions
    # if not current_user.has_permission("property:delete"):
    #     raise HTTPException(status_code=403, detail="Not authorized to delete properties")
    
    property = db.query(Property).filter(
        Property.id == property_id,
        # Property.company_id == current_user.company_id  # TODO: Add company filter
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Soft delete
    property.is_active = False
    db.commit()
    
    return None


@router.get("/{property_id}/units", response_model=List[dict])
async def get_property_units(
    property_id: UUID,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Get all units for a property
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        # Property.company_id == current_user.company_id  # TODO: Add company filter
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    units = db.query(Unit).filter(Unit.property_id == property_id).all()
    
    # Convert to dict for now, you should create proper Pydantic schemas
    return [unit.to_dict() for unit in units]


@router.get("/{property_id}/statistics")
async def get_property_statistics(
    property_id: UUID,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Get property statistics (occupancy, revenue, etc.)
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        # Property.company_id == current_user.company_id  # TODO: Add company filter
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Calculate statistics
    total_units = property.total_units
    occupied_units = db.query(Unit).filter(
        Unit.property_id == property_id,
        Unit.status == "occupied"
    ).count()
    
    available_units = db.query(Unit).filter(
        Unit.property_id == property_id,
        Unit.status == "available"
    ).count()
    
    maintenance_units = db.query(Unit).filter(
        Unit.property_id == property_id,
        Unit.status == "maintenance"
    ).count()
    
    # Calculate financial metrics
    monthly_revenue = property.monthly_revenue
    annual_revenue = property.annual_revenue
    occupancy_rate = property.occupancy_rate
    net_operating_income = property.net_operating_income
    
    # Get maintenance requests count (if maintenance model exists)
    # open_maintenance = db.query(MaintenanceRequest).filter(
    #     MaintenanceRequest.property_id == property_id,
    #     MaintenanceRequest.status.in_(["pending", "in_progress"])
    # ).count()
    
    # Get lease expiration data
    # from sqlalchemy import func
    # expiring_leases = db.query(Lease).join(Unit).filter(
    #     Unit.property_id == property_id,
    #     Lease.end_date <= func.date(func.now()) + timedelta(days=60),
    #     Lease.status == "active"
    # ).count()
    
    return {
        "property_id": property_id,
        "property_name": property.name,
        "occupancy": {
            "rate": round(occupancy_rate, 1),
            "occupied": occupied_units,
            "available": available_units,
            "maintenance": maintenance_units,
            "total": total_units,
            "vacant": property.vacant_units
        },
        "financial": {
            "monthly_revenue": monthly_revenue,
            "annual_revenue": annual_revenue,
            "net_operating_income": net_operating_income,
            "monthly_expenses": property.monthly_operating_expenses or 0,
            "property_tax_annual": property.property_tax_annual or 0,
            "insurance_annual": property.insurance_annual or 0
        },
        "maintenance": {
            "open_requests": 0,  # TODO: Implement when maintenance model is added
            "urgent": 0,
            "completed_this_month": 0
        },
        "leases": {
            "expiring_soon": 0,  # TODO: Implement when lease model is connected
            "expiring_this_month": 0
        },
        "last_updated": datetime.utcnow().isoformat()
    }