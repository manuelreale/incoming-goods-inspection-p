@echo off
setlocal

:: --- Paths (safe even if parent has spaces) ---
set "BACKEND_DIR=%~dp0igi-backend"
set "FRONTEND_DIR=%~dp0igi-frontend"
set "FRONTEND_PORT=5173"
set "FRONTEND_URL=http://localhost:%FRONTEND_PORT%"

echo === Closing old backend/frontend terminals (if any) ===
call :kill_window "backend"
call :kill_window "frontend"
timeout /t 1 /nobreak >nul

echo === Launching Backend & Frontend ===
start "backend"  /D "%BACKEND_DIR%"  cmd /k run.bat
start "frontend" /D "%FRONTEND_DIR%" cmd /k run.bat

echo Waiting for frontend at %FRONTEND_URL% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$u='%FRONTEND_URL%';$deadline=(Get-Date).AddMinutes(2); while((Get-Date) -lt $deadline){try{(Invoke-WebRequest -Method Head -Uri $u -TimeoutSec 2) | Out-Null; exit 0}catch{Start-Sleep 1}}; exit 1"
if %errorlevel% neq 0 echo Could not reach %FRONTEND_URL% in time. Opening browser anyway...

call :open_fullscreen "%FRONTEND_URL%"
goto :eof

:: ---------- kill a CMD window by its title ----------
:kill_window
set "TITLE=%~1"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$t='%TITLE%'; Get-Process cmd -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq $t } | ForEach-Object { Stop-Process -Id $_.Id -Force }"
goto :eof

:: ---------- open Edge kiosk fullscreen (fallback: default browser) ----------
:open_fullscreen
set "URL=%~1"

echo Closing any existing Edge windows...
taskkill /IM msedge.exe /F >nul 2>&1

set "EDGE_X64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "EDGE_X86=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE_X64%" (
    echo Launching Edge (kiosk fullscreen) at %URL%
    start "" "%EDGE_X64%" --kiosk "%URL%" --edge-kiosk-type=fullscreen
    goto :eof
)
if exist "%EDGE_X86%" (
    echo Launching Edge (kiosk fullscreen) at %URL%
    start "" "%EDGE_X86%" --kiosk "%URL%" --edge-kiosk-type=fullscreen
    goto :eof
)

echo Edge not found! Falling back to default browser...
start "" "%URL%"
goto :eof