from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import date
from enum import Enum

# Property Schemas
class PropertyBase(BaseModel):
    name: str
    property_type: str = "residential"
    address: Dict[str, str]
    year_built: Optional[int] = None
    purchase_price: Optional[float] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(PropertyBase):
    name: Optional[str] = None
    address: Optional[Dict[str, str]] = None

class PropertyResponse(PropertyBase):
    id: str
    total_units: int = 0
    occupied_units: int = 0
    monthly_revenue: float = 0
    occupancy_rate: float = 0
    
    class Config:
        from_attributes = True

# Unit Schemas
class UnitBase(BaseModel):
    unit_number: str
    property_id: str
    bedrooms: int = 1
    bathrooms: float = 1.0
    square_feet: Optional[int] = None
    rent_amount: float
    deposit_amount: Optional[float] = None
    amenities: List[str] = []

class UnitCreate(UnitBase):
    pass

class UnitUpdate(UnitBase):
    unit_number: Optional[str] = None
    rent_amount: Optional[float] = None
    status: Optional[str] = None

class UnitResponse(UnitBase):
    id: str
    status: str
    property_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Tenant Schemas
class TenantBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    credit_score: Optional[int] = None
    monthly_income: Optional[float] = None

class TenantCreate(TenantBase):
    pass

class TenantResponse(TenantBase):
    id: str
    full_name: str
    
    class Config:
        from_attributes = True

# Lease Schemas
class LeaseBase(BaseModel):
    unit_id: str
    tenant_id: str
    start_date: date
    end_date: date
    monthly_rent: float
    deposit_amount: float
    auto_renew: bool = False

class LeaseCreate(LeaseBase):
    pass

class LeaseUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    monthly_rent: Optional[float] = None
    deposit_amount: Optional[float] = None
    auto_renew: Optional[bool] = None

class LeaseResponse(LeaseBase):
    id: str
    status: str
    is_expiring_soon: bool
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    lease_id: str
    amount: float
    payment_type: str = "rent"
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    payment_date: Optional[date] = None

class PaymentResponse(PaymentBase):
    id: str
    tenant_id: str
    payment_date: date
    status: str
    
    class Config:
        from_attributes = True