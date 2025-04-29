#!/bin/bash

# Kill existing node processes
echo "Stopping existing servers..."
pkill -f "node index.js"
pkill -f "react-scripts start"

# Start backend
echo "Starting backend server..."
cd /home/nitiraj/Minor/Backend
node index.js &

# Wait for backend to start
sleep 2

# Start frontend
echo "Starting frontend server..."
cd /home/nitiraj/Minor/Backend/frontend
npm start &

echo "Servers restarted!"
echo "Backend is running at http://localhost:3000"
echo "Frontend is running at http://localhost:3001" 