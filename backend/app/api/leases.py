"""
Lease management API endpoints
"""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..database import get_db
from ..models.lease import Lease, LeaseStatus
from ..models.user import User
from ..services.auth_service import get_current_user
from ..schemas import LeaseCreate, LeaseUpdate, LeaseResponse

router = APIRouter()

@router.get("/", response_model=List[LeaseResponse])
async def list_leases(
    skip: int = 0,
    limit: int = 100,
    status: Optional[LeaseStatus] = None,
    property_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all leases with optional filtering"""
    query = db.query(Lease)
    
    if status:
        query = query.filter(Lease.status == status)
    
    if property_id:
        # Join with Unit to filter by property
        from ..models.unit import Unit
        query = query.join(Unit).filter(Unit.property_id == property_id)
    
    leases = query.offset(skip).limit(limit).all()
    
    # Add computed fields
    for lease in leases:
        lease.is_expiring_soon = (lease.end_date - datetime.now().date()).days <= 60
    
    return leases

@router.get("/{lease_id}", response_model=LeaseResponse)
async def get_lease(
    lease_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific lease by ID"""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    lease.is_expiring_soon = (lease.end_date - datetime.now().date()).days <= 60
    return lease

@router.post("/", response_model=LeaseResponse)
async def create_lease(
    lease_data: LeaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new lease"""
    # Verify unit exists and is available
    from ..models.unit import Unit, UnitStatus
    unit = db.query(Unit).filter(Unit.id == lease_data.unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    if unit.status != UnitStatus.VACANT:
        raise HTTPException(status_code=400, detail="Unit is not available")
    
    # Verify tenant exists
    from ..models.tenant import Tenant
    tenant = db.query(Tenant).filter(Tenant.id == lease_data.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Create lease
    db_lease = Lease(**lease_data.dict())
    db_lease.status = LeaseStatus.ACTIVE if lease_data.start_date <= datetime.now().date() else LeaseStatus.PENDING
    
    db.add(db_lease)
    
    # Update unit status
    unit.status = UnitStatus.OCCUPIED
    unit.current_tenant_id = tenant.id
    
    db.commit()
    db.refresh(db_lease)
    
    db_lease.is_expiring_soon = (db_lease.end_date - datetime.now().date()).days <= 60
    return db_lease

@router.put("/{lease_id}", response_model=LeaseResponse)
async def update_lease(
    lease_id: str,
    lease_update: LeaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing lease"""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    for key, value in lease_update.dict(exclude_unset=True).items():
        setattr(lease, key, value)
    
    db.commit()
    db.refresh(lease)
    
    lease.is_expiring_soon = (lease.end_date - datetime.now().date()).days <= 60
    return lease

@router.post("/{lease_id}/sign")
async def sign_lease(
    lease_id: str,
    signature_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record electronic signature on lease"""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    # In a real implementation, you would:
    # 1. Store the signature in a secure manner
    # 2. Use a proper e-signature service (DocuSign, HelloSign, etc.)
    # 3. Record IP address, timestamp, and other audit trail info
    
    # For now, we'll just update the lease status
    if lease.status == LeaseStatus.PENDING:
        lease.status = LeaseStatus.ACTIVE
        db.commit()
    
    return {"message": "Lease signed successfully", "lease_id": lease_id}

@router.post("/send-email")
async def email_lease(
    email_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Email lease document to tenant"""
    # In production, integrate with email service like SendGrid, AWS SES, etc.
    # For now, we'll simulate the email sending
    
    try:
        # Validate email data
        if not email_data.get('recipient'):
            raise HTTPException(status_code=400, detail="Recipient email required")
        
        if not email_data.get('lease_id'):
            raise HTTPException(status_code=400, detail="Lease ID required")
        
        # In production: Send actual email
        # await email_service.send_lease_document(
        #     to=email_data['recipient'],
        #     lease_id=email_data['lease_id'],
        #     document_html=email_data.get('document_html', '')
        # )
        
        return {
            "message": "Lease emailed successfully",
            "recipient": email_data['recipient']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@router.get("/{lease_id}/document")
async def get_lease_document(
    lease_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate lease document data for frontend rendering"""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    # Get related data
    from ..models.unit import Unit
    from ..models.tenant import Tenant
    from ..models.property import Property
    
    unit = db.query(Unit).filter(Unit.id == lease.unit_id).first()
    tenant = db.query(Tenant).filter(Tenant.id == lease.tenant_id).first()
    property = db.query(Property).filter(Property.id == unit.property_id).first() if unit else None
    
    return {
        "lease": lease,
        "unit": unit,
        "tenant": tenant,
        "property": property,
        "generated_at": datetime.now().isoformat()
    }

@router.post("/{lease_id}/terminate")
async def terminate_lease(
    lease_id: str,
    termination_data: dict = {},
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Terminate a lease"""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    # Update lease status
    lease.status = LeaseStatus.TERMINATED
    lease.termination_date = termination_data.get('termination_date', datetime.now().date())
    lease.termination_reason = termination_data.get('reason', 'Terminated by user')
    
    # Update unit status
    from ..models.unit import Unit, UnitStatus
    unit = db.query(Unit).filter(Unit.id == lease.unit_id).first()
    if unit:
        unit.status = UnitStatus.VACANT
        unit.current_tenant_id = None
    
    db.commit()
    
    return {"message": "Lease terminated successfully", "lease_id": lease_id}

@router.get("/expiring/soon")
async def get_expiring_leases(
    days: int = 60,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leases expiring within specified days"""
    expiry_date = datetime.now().date() + timedelta(days=days)
    
    leases = db.query(Lease).filter(
        and_(
            Lease.status == LeaseStatus.ACTIVE,
            Lease.end_date <= expiry_date,
            Lease.end_date >= datetime.now().date()
        )
    ).all()
    
    return {
        "count": len(leases),
        "leases": leases,
        "days_threshold": days
    }