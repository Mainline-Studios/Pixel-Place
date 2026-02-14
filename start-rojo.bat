@echo off
echo ========================================
echo Starting Rojo Server
echo ========================================
echo.

echo Checking for Rojo...
where rojo >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Rojo is not installed!
    echo.
    echo Please run install-rojo.bat first, or install manually:
    echo npm install -g rojo
    echo.
    pause
    exit /b 1
)

echo Rojo found!
echo.
echo Starting Rojo server on port 34872...
echo.
echo Keep this window open while using Roblox Studio.
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

cd /d "%~dp0"
rojo serve

pause
