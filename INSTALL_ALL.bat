@echo off
echo ========================================
echo   Pixel Place - Installing All Dependencies
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing ALL dependencies...
echo This may take a few minutes...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Dependencies Installed Successfully!
echo ========================================
echo.
echo Verifying key packages...
echo.

call npm list react next three stripe socket.io-client @stripe/stripe-js 2>nul

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo You can now run: npm run dev
echo Or double-click: START.bat
echo.
pause


















