@echo off
echo ========================================
echo   Starting Pixel Place Windows App
echo ========================================
echo.

cd /d "%~dp0"

echo Checking if app is built...
if not exist ".next" (
    echo App not built yet. Building now...
    call npm run build
    echo.
)

echo Starting Pixel Place app...
echo.
echo Note: This will start the app in a window.
echo Close this window to exit the app.
echo.

call npm run app

pause

