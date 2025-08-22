@echo off
setlocal

:: === Paths & settings ===
set "BACKEND_DIR=%~dp0igi-backend"
set "FRONTEND_DIR=%~dp0igi-frontend"
set "FRONTEND_PORT=5173"
set "FRONTEND_URL=http://localhost:%FRONTEND_PORT%"

echo === Launching Backend & Frontend ===

:: Backend in new terminal
start "backend" cmd /k "cd /d "%BACKEND_DIR%" && run.bat"

:: Frontend in new terminal
start "frontend" cmd /k "cd /d "%FRONTEND_DIR%" && run.bat"

echo Waiting for frontend at %FRONTEND_URL% ...

:: Wait up to 2 minutes for the dev server to respond
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$u='%FRONTEND_URL%';$deadline=(Get-Date).AddMinutes(2); while((Get-Date) -lt $deadline){ try { Invoke-WebRequest -UseBasicParsing $u | Out-Null; exit 0 } catch { Start-Sleep -Seconds 1 } }; exit 1"

if %errorlevel% neq 0 (
  echo Could not reach %FRONTEND_URL% in time. Opening browser anyway...
)

call :open_fullscreen "%FRONTEND_URL%"
goto :eof

:: ---------- helpers ----------
:open_fullscreen
set "URL=%~1"

:: Try Microsoft Edge
for %%E in ("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe") do (
  if exist %%E (
    start "Edge" "%%E" --start-fullscreen "%URL%"
    goto :eof
  )
)

:: Try Google Chrome
for %%C in ("%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%ProgramFiles%\Google\Chrome\Application\chrome.exe") do (
  if exist %%C (
    start "Chrome" "%%C" --start-fullscreen "%URL%"
    goto :eof
  )
)

:: Fallback: default browser (fullscreen not guaranteed)
start "" "%URL%"
goto :eof