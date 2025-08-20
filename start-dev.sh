#!/bin/bash

echo "🧪 Starting IGI backend..."

cd /Users/manuel.reale/Desktop/IGI-Software/igi-backend
source venv/bin/activate
uvicorn main:app --reload --reload-dir . &

BACKEND_PID=$!

echo "🌱 Starting IGI frontend..."

cd /Users/manuel.reale/Desktop/IGI-Software/igi-frontend
bun run dev &

FRONTEND_PID=$!

sleep 2

echo "🌐 Launching browser..."
open -a "Google Chrome" --args --start-fullscreen http://localhost:5173

wait $BACKEND_PID
wait $FRONTEND_PID