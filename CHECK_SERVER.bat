@echo off
echo Checking if server is running...
echo.

netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo.
    echo ✅ Server IS running on port 3000!
    echo.
    echo Open your browser and go to: http://localhost:3000
) else (
    echo.
    echo ❌ Server is NOT running on port 3000
    echo.
    echo The server window should be open. Check it for errors.
    echo.
    echo Common issues:
    echo 1. Dependencies not installed - run: npm install
    echo 2. Port 3000 busy - try: npm run dev -- -p 3001
    echo 3. Compilation errors - check the server window
    echo.
)

pause


















