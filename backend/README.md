# Property Management Backend

A modern, scalable property management system built with FastAPI, SQLAlchemy, and PostgreSQL.

## Features

- 🔐 JWT-based authentication with role-based access control
- 🏢 Multi-tenant architecture with company isolation
- 📊 Real-time dashboard metrics and analytics
- 🏠 Comprehensive property and unit management
- 👥 Tenant and lease tracking
- 💰 Financial management integration ready
- 📱 RESTful API with automatic documentation
- 🔄 Database migrations with Alembic

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Node.js 16+ (for frontend)

### Setup

1. **Run the setup script:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

2. **Create PostgreSQL database:**
```bash
createdb property_mgmt
```

3. **Update `.env` file with your database credentials**

4. **Run database migrations:**
```bash
source venv/bin/activate
alembic upgrade head
```

5. **Start the server:**
```bash
python run.py
```

The API will be available at `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── api/           # API endpoints
│   ├── models/        # Database models
│   ├── services/      # Business logic
│   ├── utils/         # Utilities
│   ├── config.py      # Configuration
│   ├── database.py    # Database setup
│   └── main.py        # FastAPI app
├── alembic/           # Database migrations
├── tests/             # Test suite
├── requirements.txt   # Dependencies
└── .env              # Environment variables
```

## API Documentation

### Authentication

#### Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "company_id": "company-uuid",
  "role": "property_manager"
}
```

#### Login
```bash
POST /api/v1/auth/token
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword
```

### Dashboard

#### Get Metrics
```bash
GET /api/v1/dashboard/metrics
Authorization: Bearer <token>
```

Response:
```json
{
  "occupancy": {
    "rate": 92.5,
    "occupied": 185,
    "available": 15,
    "total": 200
  },
  "revenue": {
    "current": 2500000,
    "target": 3000000,
    "change": 12.5
  },
  "maintenance": {
    "open": 18,
    "urgent": 3,
    "completed": 45
  }
}
```

### Properties

#### List Properties
```bash
GET /api/v1/properties?search=downtown&limit=10
Authorization: Bearer <token>
```

#### Get Property Statistics
```bash
GET /api/v1/properties/{property_id}/statistics
Authorization: Bearer <token>
```

## User Roles

- **super_admin**: Full system access
- **company_admin**: Company-wide management
- **property_manager**: Property operations
- **maintenance_staff**: Maintenance tasks
- **leasing_agent**: Leasing operations
- **accountant**: Financial access
- **viewer**: Read-only access

## Development

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one version
alembic downgrade -1
```

### Code Quality
```bash
# Format code
black app/

# Lint
flake8 app/

# Type checking
mypy app/
```

## Environment Variables

See `.env.example` for all available configuration options:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `DEBUG`: Enable debug mode
- `BACKEND_CORS_ORIGINS`: Allowed CORS origins

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/token` - Login (OAuth2)
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/change-password` - Change password

### Dashboard
- `GET /api/v1/dashboard/metrics` - Dashboard metrics
- `GET /api/v1/dashboard/calendar` - Calendar events
- `GET /api/v1/dashboard/notifications` - User notifications

### Properties
- `GET /api/v1/properties` - List properties
- `POST /api/v1/properties` - Create property
- `GET /api/v1/properties/{id}` - Get property
- `PUT /api/v1/properties/{id}` - Update property
- `DELETE /api/v1/properties/{id}` - Delete property
- `GET /api/v1/properties/{id}/statistics` - Property stats
- `GET /api/v1/properties/{id}/units` - List property units

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

Proprietary - All rights reserved