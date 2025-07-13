#!/bin/bash

# Backend setup script

echo "Setting up Property Management Backend..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file from example if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Application settings
APP_NAME="Property Management System"
DEBUG=True

# Database settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=property_mgmt
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Security settings
SECRET_KEY=your-secret-key-here-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email settings (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAILS_FROM_EMAIL=noreply@propertymanagement.com
EMAILS_FROM_NAME="Property Management"
EOF
    echo ".env file created. Please update it with your actual settings."
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your database credentials"
echo "2. Create the PostgreSQL database: createdb property_mgmt"
echo "3. Run migrations: alembic upgrade head"
echo "4. Start the server: python run.py"
echo ""
echo "Or use the quick start:"
echo "   source venv/bin/activate"
echo "   python run.py"