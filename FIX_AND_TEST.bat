@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Pixel Place - Fix and Test
echo ========================================
echo.

cd /d "%~dp0"

echo [Step 1] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is NOT installed!
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo ✅ Node.js found
echo.

echo [Step 2] Checking npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is NOT installed!
    pause
    exit /b 1
)
npm --version
echo ✅ npm found
echo.

echo [Step 3] Installing/Updating dependencies...
if not exist "node_modules" (
    echo Installing dependencies (this may take a few minutes)...
    call npm install
    if !errorlevel! neq 0 (
        echo.
        echo ❌ npm install failed!
        echo Check the error messages above
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed, updating...
    call npm install
)
echo ✅ Dependencies ready
echo.

echo [Step 4] Checking for compilation errors...
call npm run build > build_output.txt 2>&1
if !errorlevel! neq 0 (
    echo.
    echo ⚠️  Build errors found! Check build_output.txt
    echo.
    type build_output.txt
    echo.
    echo Trying to start dev server anyway...
) else (
    echo ✅ No build errors
)
echo.

echo [Step 5] Starting development server...
echo.
echo ========================================
echo   Server starting on http://localhost:3000
echo ========================================
echo.
echo Wait for "Ready" message, then open:
echo   http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev











