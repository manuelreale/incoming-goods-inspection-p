@echo off
setlocal

:: --- Paths (safe even if parent has spaces) ---
set "BACKEND_DIR=%~dp0igi-backend"
set "FRONTEND_DIR=%~dp0igi-frontend"
set "FRONTEND_PORT=3000"
set "FRONTEND_URL=http://localhost:%FRONTEND_PORT%"

echo === Launching Backend & Frontend ===

:: New windows, start in those folders
start "backend" /D "%BACKEND_DIR%" cmd /k run.bat
start "frontend" /D "%FRONTEND_DIR%" cmd /k run.bat

echo Waiting for frontend at %FRONTEND_URL% ...

:: Wait up to 2 minutes for the dev server
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$u='%FRONTEND_URL%';$deadline=(Get-Date).AddMinutes(2); while((Get-Date) -lt $deadline){try{(Invoke-WebRequest -Method Head -Uri $u -TimeoutSec 2) | Out-Null; exit 0}catch{Start-Sleep 1}}; exit 1"

if %errorlevel% neq 0 (
  echo Could not reach %FRONTEND_URL% in time. Opening browser anyway...
)

call :open_fullscreen "%FRONTEND_URL%"
goto :eof

:: ---------- open browser full-screen (no double-quoting) ----------
:open_fullscreen
set "URL=%~1"

set "EDGE_X64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "EDGE_X86=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "CHROME_X64=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME_X86=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if exist "%EDGE_X64%"  ( start "" "%EDGE_X64%"  --start-fullscreen "%URL%" & goto :eof )
if exist "%EDGE_X86%"  ( start "" "%EDGE_X86%"  --start-fullscreen "%URL%" & goto :eof )
if exist "%CHROME_X64%"( start "" "%CHROME_X64%" --start-fullscreen "%URL%" & goto :eof )
if exist "%CHROME_X86%"( start "" "%CHROME_X86%" --start-fullscreen "%URL%" & goto :eof )

:: Fallback to default browser (fullscreen not guaranteed)
start "" "%URL%"
goto :eof