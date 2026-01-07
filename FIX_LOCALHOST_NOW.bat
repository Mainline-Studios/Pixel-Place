@echo off
echo ========================================
echo Fixing Localhost - Pixel Place
echo ========================================
echo.

echo Step 1: Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found!
echo.

echo Step 2: Killing any process on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /PID %%a /F >nul 2>&1
)
echo Port 3000 cleared!
echo.

echo Step 3: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed!
echo.

echo Step 4: Starting development server...
echo.
echo ========================================
echo Server starting on http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run dev

