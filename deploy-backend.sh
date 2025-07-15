#!/bin/bash

# Backend deployment script
echo "Deploying backend to server..."

# Replace with your backend server details
BACKEND_SERVER="your-backend-server.com"
BACKEND_USER="your-username"
BACKEND_PATH="/opt/property-management"

# Copy backend files to server
rsync -avz --exclude='venv' --exclude='__pycache__' --exclude='*.pyc' backend/ ${BACKEND_USER}@${BACKEND_SERVER}:${BACKEND_PATH}/

# Remote setup script
ssh ${BACKEND_USER}@${BACKEND_SERVER} << 'EOF'
cd /opt/property-management
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
EOF

echo "Backend deployed successfully!"