#!/bin/bash

echo "Starting Property Management System..."

# Start backend server
echo "Starting backend server..."
cd "../back new"
pip install -r requirements.txt
python main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd "../front new"
python3 -m http.server 8000 &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started!"
echo "Frontend: http://localhost:8000"
echo "Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait