#!/bin/bash

# Move to the project directory (update this path if needed)
cd "$(dirname "$0")"

echo "🧪 Starting IGI backend..."
# Start backend in background
uvicorn main:app --reload --reload-dir . &

echo "🌱 Starting IGI frontend..."
# Start frontend
bun run dev &

# Optional: Open browser in fullscreen (works on macOS + Linux with Chromium)
sleep 3
if command -v open &> /dev/null; then
  open -a "Google Chrome" --args --start-fullscreen http://localhost:3000
elif command -v xdg-open &> /dev/null; then
  xdg-open http://localhost:3000
fi

# Wait for user to close (optional)
wait