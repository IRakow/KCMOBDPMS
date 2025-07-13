"""
Units API endpoints
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from pydantic import BaseModel, Field
from datetime import datetime

from ..database import get_db
from ..models import Unit, UnitStatus, UnitType, Property, Lease
from ..config import settings


router = APIRouter()


# Pydantic schemas
class UnitBase(BaseModel):
    unit_number: str
    unit_type: Optional[UnitType] = UnitType.ONE_BEDROOM
    floor: Optional[int] = None
    bedrooms: int = 1
    bathrooms: float = 1.0
    square_feet: Optional[float] = None
    market_rent: float
    deposit_amount: Optional[float] = None
    is_furnished: bool = False
    features: List[str] = []
    utilities_included: List[str] = []
    notes: Optional[str] = None


class UnitCreate(BaseModel):
    property_id: UUID
    unit_number: str
    bedrooms: int = 1
    bathrooms: float = 1.0
    square_feet: Optional[float] = None
    rent_amount: float
    deposit_amount: Optional[float] = None
    is_furnished: bool = False
    features: List[str] = []
    amenities: List[str] = []  # Alias for features to match frontend


class UnitUpdate(BaseModel):
    unit_number: Optional[str] = None
    unit_type: Optional[UnitType] = None
    floor: Optional[int] = None
    status: Optional[UnitStatus] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    square_feet: Optional[float] = None
    market_rent: Optional[float] = None
    deposit_amount: Optional[float] = None
    is_furnished: Optional[bool] = None
    features: Optional[List[str]] = None
    utilities_included: Optional[List[str]] = None
    notes: Optional[str] = None


class UnitResponse(BaseModel):
    id: UUID
    unit_number: str
    unit_type: UnitType
    floor: Optional[int]
    status: UnitStatus
    bedrooms: int
    bathrooms: float
    square_feet: Optional[float]
    market_rent: float
    rent_amount: float  # Alias for market_rent
    deposit_amount: Optional[float]
    is_furnished: bool
    features: List[str]
    amenities: List[str]  # Alias for features
    utilities_included: List[str]
    notes: Optional[str]
    property_id: UUID
    property_name: Optional[str] = None
    tenant_name: Optional[str] = None
    lease_end: Optional[datetime] = None
    days_on_market: int = 0
    last_maintenance: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UnitListResponse(BaseModel):
    total: int
    results: List[UnitResponse]


# API Endpoints
@router.get("/", response_model=UnitListResponse)
async def list_units(
    property_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    List units with optional filtering
    """
    # Build query
    query = db.query(Unit).join(
        Property, Unit.property_id == Property.id
    )
    
    # TODO: Add company filter based on current user
    # query = query.filter(Property.company_id == current_user.company_id)
    
    # Apply filters
    if property_id and property_id != 'all':
        query = query.filter(Unit.property_id == property_id)
    
    if status and status != 'all':
        # Handle frontend status names
        status_map = {
            'vacant': UnitStatus.AVAILABLE,
            'occupied': UnitStatus.OCCUPIED,
            'maintenance': UnitStatus.MAINTENANCE
        }
        unit_status = status_map.get(status, status)
        query = query.filter(Unit.status == unit_status)
    
    units = query.all()
    
    # Enrich unit data
    unit_responses = []
    for unit in units:
        unit_dict = {
            'id': unit.id,
            'unit_number': unit.unit_number,
            'unit_type': unit.unit_type,
            'floor': unit.floor,
            'status': unit.status,
            'bedrooms': unit.bedrooms,
            'bathrooms': unit.bathrooms,
            'square_feet': unit.square_feet,
            'market_rent': unit.market_rent,
            'rent_amount': unit.market_rent,  # Alias
            'deposit_amount': unit.deposit_amount,
            'is_furnished': unit.is_furnished,
            'features': unit.features or [],
            'amenities': unit.features or [],  # Alias
            'utilities_included': unit.utilities_included or [],
            'notes': unit.notes,
            'property_id': unit.property_id,
            'property_name': unit.property_ref.name if unit.property_ref else None,
            'tenant_name': None,
            'lease_end': None,
            'days_on_market': 0,
            'last_maintenance': unit.updated_at,  # Placeholder
            'created_at': unit.created_at,
            'updated_at': unit.updated_at
        }
        
        # Get current tenant info if occupied
        if unit.status == UnitStatus.OCCUPIED:
            active_lease = db.query(Lease).filter(
                Lease.unit_id == unit.id,
                Lease.status == 'active'
            ).first()
            
            if active_lease and active_lease.tenant:
                unit_dict['tenant_name'] = f"{active_lease.tenant.first_name} {active_lease.tenant.last_name}"
                unit_dict['lease_end'] = active_lease.end_date
        
        # Calculate days on market for vacant units
        if unit.status == UnitStatus.AVAILABLE:
            # Simple calculation - days since last updated
            days_vacant = (datetime.utcnow() - unit.updated_at).days
            unit_dict['days_on_market'] = days_vacant
        
        unit_responses.append(UnitResponse(**unit_dict))
    
    return UnitListResponse(
        total=len(unit_responses),
        results=unit_responses
    )


@router.post("/", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
async def create_unit(
    unit_data: UnitCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Create a new unit
    """
    # TODO: Verify property belongs to user's company
    property = db.query(Property).filter(
        Property.id == unit_data.property_id,
        # Property.company_id == current_user.company_id
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check if unit number already exists in this property
    existing = db.query(Unit).filter(
        Unit.property_id == unit_data.property_id,
        Unit.unit_number == unit_data.unit_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unit number already exists in this property"
        )
    
    # Determine unit type based on bedrooms
    unit_type = UnitType.STUDIO if unit_data.bedrooms == 0 else \
                UnitType.ONE_BEDROOM if unit_data.bedrooms == 1 else \
                UnitType.TWO_BEDROOM if unit_data.bedrooms == 2 else \
                UnitType.THREE_BEDROOM if unit_data.bedrooms == 3 else \
                UnitType.FOUR_BEDROOM
    
    # Create unit
    unit = Unit(
        property_id=unit_data.property_id,
        unit_number=unit_data.unit_number,
        unit_type=unit_type,
        bedrooms=unit_data.bedrooms,
        bathrooms=unit_data.bathrooms,
        square_feet=unit_data.square_feet,
        market_rent=unit_data.rent_amount,
        deposit_amount=unit_data.deposit_amount or unit_data.rent_amount,  # Default to one month rent
        is_furnished=unit_data.is_furnished,
        features=unit_data.features or unit_data.amenities,  # Use amenities if features not provided
        status=UnitStatus.AVAILABLE
    )
    
    db.add(unit)
    
    # Update property unit count
    property.total_units = db.query(Unit).filter(
        Unit.property_id == property.id
    ).count() + 1
    
    db.commit()
    db.refresh(unit)
    
    # Return enriched response
    return UnitResponse(
        id=unit.id,
        unit_number=unit.unit_number,
        unit_type=unit.unit_type,
        floor=unit.floor,
        status=unit.status,
        bedrooms=unit.bedrooms,
        bathrooms=unit.bathrooms,
        square_feet=unit.square_feet,
        market_rent=unit.market_rent,
        rent_amount=unit.market_rent,
        deposit_amount=unit.deposit_amount,
        is_furnished=unit.is_furnished,
        features=unit.features or [],
        amenities=unit.features or [],
        utilities_included=unit.utilities_included or [],
        notes=unit.notes,
        property_id=unit.property_id,
        property_name=property.name,
        tenant_name=None,
        lease_end=None,
        days_on_market=0,
        last_maintenance=unit.updated_at,
        created_at=unit.created_at,
        updated_at=unit.updated_at
    )


@router.get("/{unit_id}", response_model=UnitResponse)
async def get_unit(
    unit_id: UUID,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Get a single unit by ID
    """
    unit = db.query(Unit).join(
        Property, Unit.property_id == Property.id
    ).filter(
        Unit.id == unit_id,
        # Property.company_id == current_user.company_id  # TODO: Add company filter
    ).first()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Build response
    unit_dict = {
        'id': unit.id,
        'unit_number': unit.unit_number,
        'unit_type': unit.unit_type,
        'floor': unit.floor,
        'status': unit.status,
        'bedrooms': unit.bedrooms,
        'bathrooms': unit.bathrooms,
        'square_feet': unit.square_feet,
        'market_rent': unit.market_rent,
        'rent_amount': unit.market_rent,
        'deposit_amount': unit.deposit_amount,
        'is_furnished': unit.is_furnished,
        'features': unit.features or [],
        'amenities': unit.features or [],
        'utilities_included': unit.utilities_included or [],
        'notes': unit.notes,
        'property_id': unit.property_id,
        'property_name': unit.property_ref.name if unit.property_ref else None,
        'tenant_name': None,
        'lease_end': None,
        'days_on_market': 0,
        'last_maintenance': unit.updated_at,
        'created_at': unit.created_at,
        'updated_at': unit.updated_at
    }
    
    return UnitResponse(**unit_dict)


@router.patch("/{unit_id}", response_model=UnitResponse)
async def update_unit(
    unit_id: UUID,
    unit_update: UnitUpdate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Update a unit
    """
    unit = db.query(Unit).join(
        Property, Unit.property_id == Property.id
    ).filter(
        Unit.id == unit_id,
        # Property.company_id == current_user.company_id  # TODO: Add company filter
    ).first()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Update fields
    update_data = unit_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(unit, field, value)
    
    db.commit()
    db.refresh(unit)
    
    # Build response
    unit_dict = {
        'id': unit.id,
        'unit_number': unit.unit_number,
        'unit_type': unit.unit_type,
        'floor': unit.floor,
        'status': unit.status,
        'bedrooms': unit.bedrooms,
        'bathrooms': unit.bathrooms,
        'square_feet': unit.square_feet,
        'market_rent': unit.market_rent,
        'rent_amount': unit.market_rent,
        'deposit_amount': unit.deposit_amount,
        'is_furnished': unit.is_furnished,
        'features': unit.features or [],
        'amenities': unit.features or [],
        'utilities_included': unit.utilities_included or [],
        'notes': unit.notes,
        'property_id': unit.property_id,
        'property_name': unit.property_ref.name if unit.property_ref else None,
        'tenant_name': None,
        'lease_end': None,
        'days_on_market': 0,
        'last_maintenance': unit.updated_at,
        'created_at': unit.created_at,
        'updated_at': unit.updated_at
    }
    
    return UnitResponse(**unit_dict)


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_unit(
    unit_id: UUID,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Delete a unit
    """
    unit = db.query(Unit).join(
        Property, Unit.property_id == Property.id
    ).filter(
        Unit.id == unit_id,
        # Property.company_id == current_user.company_id  # TODO: Add company filter
    ).first()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check if unit has active lease
    active_lease = db.query(Lease).filter(
        Lease.unit_id == unit_id,
        Lease.status == 'active'
    ).first()
    
    if active_lease:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete unit with active lease"
        )
    
    # Delete unit
    db.delete(unit)
    
    # Update property unit count
    unit.property_ref.total_units = db.query(Unit).filter(
        Unit.property_id == unit.property_id
    ).count() - 1
    
    db.commit()
    
    return None