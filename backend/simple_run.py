#!/usr/bin/env python3
"""
Simple backend runner without complex models
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
import uvicorn

# Create FastAPI app
app = FastAPI(title="Property Management API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple models for API responses
class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str

class DashboardMetrics(BaseModel):
    occupancy: dict
    revenue: dict
    maintenance: dict
    leases: dict

# Mock data
MOCK_USERS = {
    'admin@example.com': {
        'password': 'admin123',
        'user': {
            'id': '1',
            'email': 'admin@example.com',
            'first_name': 'John',
            'last_name': 'Admin',
            'role': 'super_admin'
        }
    }
}

# Routes
@app.get("/")
async def root():
    return {"message": "Property Management API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/v1/auth/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 compatible login"""
    user_data = MOCK_USERS.get(form_data.username)
    if not user_data or user_data['password'] != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "access_token": f"mock_token_{form_data.username}",
        "token_type": "bearer"
    }

@app.get("/api/v1/auth/me")
async def get_current_user():
    """Get current user info"""
    # For demo, return the admin user
    return {
        "user": MOCK_USERS['admin@example.com']['user']
    }

@app.get("/api/v1/dashboard/metrics")
async def get_dashboard_metrics():
    """Get dashboard metrics"""
    return {
        "occupancy": {
            "rate": 92.5,
            "occupied": 185,
            "available": 15,
            "maintenance": 5,
            "total": 200,
            "change": 3.5
        },
        "revenue": {
            "current": 2500000,
            "target": 3000000,
            "change": 12.5,
            "monthly_expenses": 180000
        },
        "maintenance": {
            "open": 18,
            "urgent": 3,
            "completed": 45
        },
        "leases": {
            "expiring": 8,
            "this_month": 3
        },
        "last_updated": "2024-07-12T10:30:00Z"
    }

@app.get("/api/v1/dashboard/calendar")
async def get_calendar():
    """Get calendar events"""
    return {
        "total_events": 3,
        "next_event": "2:00 PM - Vendor Meeting",
        "events": [
            {"time": "09:00 AM", "title": "Property Inspection"},
            {"time": "02:00 PM", "title": "Vendor Meeting"},
            {"time": "04:00 PM", "title": "Lease Signing"}
        ]
    }

if __name__ == "__main__":
    print("🚀 Starting simple Property Management API...")
    print("📊 Dashboard: http://localhost:8000/api/v1/dashboard/metrics")
    print("📖 Docs: http://localhost:8000/docs")
    
    uvicorn.run(
        "simple_run:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )