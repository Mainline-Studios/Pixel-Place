@echo off
cd /d "%~dp0"
echo ========================================
echo   Pixel Place - Auto Deploy to Vercel
echo ========================================
echo Deploying from: %CD%
echo.

echo [1/4] Installing Vercel CLI...
call npm install -g vercel
if errorlevel 1 (
    echo ERROR: Failed to install Vercel CLI
    pause
    exit /b 1
)
echo.

echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/4] Building app...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo [4/5] Logging into Vercel...
call vercel login
if errorlevel 1 (
    echo ERROR: Login failed
    pause
    exit /b 1
)
echo.

echo [5/5] Deploying to Vercel...
echo.
echo NOTE: You'll be asked to:
echo   - Press Enter for all prompts
echo   - Confirm deployment
echo.
call vercel --prod
if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)
echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your app is now live! Check the URL above.
echo Open it in Chrome/Edge to install the PWA.
echo.
pause
