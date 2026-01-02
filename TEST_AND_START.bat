@echo off
echo ========================================
echo   Pixel Place - Test and Start
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is not installed!
    echo Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js found
echo.

echo Step 2: Installing/Updating dependencies...
echo This may take a few minutes...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed!
    echo Check the error messages above
    pause
    exit /b 1
)
echo.
echo ✅ Dependencies installed
echo.

echo Step 3: Checking for port conflicts...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  Port 3000 is in use!
    echo.
    echo Choose an option:
    echo 1. Use port 3001 instead (recommended)
    echo 2. Cancel and free port 3000
    echo.
    set /p choice="Enter 1 or 2: "
    if "!choice!"=="1" (
        set PORT=3001
        set URL=http://localhost:3001
    ) else (
        echo Cancelled. Free port 3000 and try again.
        pause
        exit /b 0
    )
) else (
    set PORT=3000
    set URL=http://localhost:3000
)
echo.

echo Step 4: Starting development server...
echo.
echo ========================================
echo   Server starting on: %URL%
echo ========================================
echo.
echo Wait for "Ready" message, then:
echo 1. Open your browser
echo 2. Go to: %URL%
echo.
echo Press Ctrl+C to stop the server
echo.

if "%PORT%"=="3001" (
    call npm run dev -- -p 3001
) else (
    call npm run dev
)











