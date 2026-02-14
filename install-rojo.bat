@echo off
echo ========================================
echo Installing Rojo (Roblox Studio Sync)
echo ========================================
echo.

echo Checking for Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Node.js is not installed or not in PATH!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installing, restart your computer and try again.
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.
echo Installing Rojo globally...
echo.

call npm install -g rojo

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install Rojo!
    echo.
    echo Alternative: Download Rojo manually from:
    echo https://github.com/rojo-rbx/rojo/releases
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Rojo installed successfully!
echo ========================================
echo.
echo To use Rojo:
echo 1. Open a terminal in this folder
echo 2. Run: rojo serve
echo 3. Open Roblox Studio
echo 4. Click the Rojo button in Studio
echo 5. Click Connect
echo.
echo The default.project.json file is already configured!
echo.
pause
