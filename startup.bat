@echo off
echo === Launching Backend and Frontend ===

:: Open backend in new terminal
start cmd /k "cd /d %~dp0igi-backend && run.bat"

:: Open frontend in new terminal
start cmd /k "cd /d %~dp0igi-frontend && run.bat"

echo Both servers are starting in separate windows...