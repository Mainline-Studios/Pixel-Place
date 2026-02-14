@echo off
echo Fixing localhost issues...
echo.

echo Checking if port 3000 is in use...
netstat -ano | findstr :3000
if %errorlevel% == 0 (
    echo Port 3000 is in use. Killing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    echo Process killed.
    timeout /t 2 /nobreak >nul
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting dev server...
echo If port 3000 is still in use, the server will use port 3001 automatically.
call npm run dev
