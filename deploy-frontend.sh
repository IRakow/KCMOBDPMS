#!/bin/bash

# Frontend deployment script
echo "Building frontend..."
python3 build_enhanced.py

echo "Deploying to frontend server..."
# Replace with your frontend server details
FRONTEND_SERVER="your-frontend-server.com"
FRONTEND_USER="your-username"
FRONTEND_PATH="/var/www/html"

# Copy built files to frontend server
scp -r dist/* ${FRONTEND_USER}@${FRONTEND_SERVER}:${FRONTEND_PATH}/

echo "Frontend deployed successfully!"