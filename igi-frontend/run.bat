@echo off
echo === Bun Project Setup ===

:: Check if bun is installed
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo Bun is not installed. Please install it first from https://bun.sh
    pause
    exit /b
)

echo Installing dependencies...
bun install

echo Starting dev server...
bun run dev

pause