@echo off
cd /d "%~dp0"

echo Installing dependencies if needed...
if not exist "node_modules" (
    call npm install
)

echo.
echo Starting server...
echo.
echo ========================================
echo   Watch this window for errors!
echo ========================================
echo.

npm run dev

pause


