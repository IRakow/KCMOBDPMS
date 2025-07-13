"""
Dashboard API endpoints for aggregated metrics
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ..database import get_db
from ..models import Property, Unit, User
from ..config import settings


router = APIRouter()


@router.get("/metrics")
async def get_dashboard_metrics(
    property_id: Optional[UUID] = Query(None, description="Filter by specific property"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Implement authentication
):
    """
    Get aggregated dashboard metrics for properties
    """
    # Base query - filter by company when auth is implemented
    property_query = db.query(Property)
    unit_query = db.query(Unit)
    
    # Filter by specific property if provided
    if property_id:
        property_query = property_query.filter(Property.id == property_id)
        unit_query = unit_query.filter(Unit.property_id == property_id)
        properties = property_query.all()
    else:
        # Get all properties for the company
        properties = property_query.all()
        property_ids = [p.id for p in properties]
        if property_ids:
            unit_query = unit_query.filter(Unit.property_id.in_(property_ids))
    
    # Calculate aggregate metrics
    total_properties = len(properties)
    total_units = sum(p.total_units for p in properties)
    
    # Unit status breakdown
    unit_stats = db.query(
        Unit.status,
        func.count(Unit.id).label('count')
    ).filter(
        Unit.property_id.in_([p.id for p in properties]) if properties else False
    ).group_by(Unit.status).all()
    
    unit_breakdown = {stat.status: stat.count for stat in unit_stats}
    occupied_units = unit_breakdown.get('occupied', 0)
    available_units = unit_breakdown.get('available', 0)
    maintenance_units = unit_breakdown.get('maintenance', 0)
    
    # Calculate financial metrics
    total_monthly_revenue = sum(p.monthly_revenue for p in properties)
    total_monthly_expenses = sum(p.monthly_operating_expenses or 0 for p in properties)
    total_noi = total_monthly_revenue - total_monthly_expenses
    
    # Calculate average occupancy rate
    avg_occupancy_rate = 0
    if total_units > 0:
        avg_occupancy_rate = (occupied_units / total_units) * 100
    
    # Trend data (mock for now - would come from historical data)
    occupancy_trend = 3.5  # % change
    revenue_trend = 12.5   # % change
    
    return {
        "overview": {
            "total_properties": total_properties,
            "total_units": total_units,
            "total_monthly_revenue": round(total_monthly_revenue, 2),
            "total_annual_revenue": round(total_monthly_revenue * 12, 2),
            "net_operating_income": round(total_noi, 2)
        },
        "occupancy": {
            "rate": round(avg_occupancy_rate, 1),
            "occupied": occupied_units,
            "available": available_units,
            "maintenance": maintenance_units,
            "total": total_units,
            "change": occupancy_trend
        },
        "revenue": {
            "current": round(total_monthly_revenue, 2),
            "target": round(total_monthly_revenue * 1.1, 2),  # 10% growth target
            "change": revenue_trend,
            "monthly_expenses": round(total_monthly_expenses, 2)
        },
        "maintenance": {
            "open": 18,  # TODO: Implement when maintenance model is added
            "urgent": 3,
            "completed": 45,
            "units_in_maintenance": maintenance_units
        },
        "leases": {
            "expiring": 8,  # TODO: Implement when lease model is connected
            "this_month": 3,
            "new_this_month": 5
        },
        "properties_breakdown": [
            {
                "id": str(p.id),
                "name": p.name,
                "occupancy_rate": round(p.occupancy_rate, 1),
                "monthly_revenue": round(p.monthly_revenue, 2),
                "units": p.total_units
            }
            for p in properties[:5]  # Top 5 properties
        ],
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("/calendar")
async def get_calendar_events(
    property_id: Optional[UUID] = Query(None),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    """
    Get calendar events for dashboard widget
    """
    # Mock data for now
    today = datetime.utcnow().date()
    
    events = [
        {
            "id": "1",
            "title": "Property Inspection - Building A",
            "time": "09:00 AM",
            "type": "inspection",
            "property_id": property_id
        },
        {
            "id": "2",
            "title": "Vendor Meeting - HVAC Maintenance",
            "time": "02:00 PM",
            "type": "meeting",
            "property_id": property_id
        },
        {
            "id": "3",
            "title": "Lease Signing - Unit 204",
            "time": "04:00 PM",
            "type": "lease",
            "property_id": property_id
        }
    ]
    
    return {
        "date": str(today),
        "total_events": len(events),
        "events": events,
        "next_event": events[0] if events else None
    }


@router.get("/notifications")
async def get_notifications(
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db),
):
    """
    Get recent notifications for dashboard
    """
    # Mock notifications for now
    notifications = [
        {
            "id": "1",
            "type": "maintenance",
            "title": "Urgent maintenance request",
            "message": "Water leak reported in Unit 305",
            "timestamp": datetime.utcnow().isoformat(),
            "read": False,
            "priority": "high"
        },
        {
            "id": "2",
            "type": "payment",
            "title": "Payment received",
            "message": "Rent payment received from John Doe - Unit 102",
            "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            "read": False,
            "priority": "normal"
        },
        {
            "id": "3",
            "type": "lease",
            "title": "Lease expiring soon",
            "message": "Lease for Unit 408 expires in 30 days",
            "timestamp": (datetime.utcnow() - timedelta(hours=5)).isoformat(),
            "read": True,
            "priority": "medium"
        }
    ]
    
    return {
        "total": len(notifications),
        "unread": sum(1 for n in notifications if not n["read"]),
        "notifications": notifications[:limit]
    }