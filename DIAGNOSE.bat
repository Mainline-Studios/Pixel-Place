@echo off
echo ========================================
echo   Pixel Place - Diagnostic Check
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is NOT installed!
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
) else (
    node --version
    echo ✅ Node.js found
)
echo.

echo [2/6] Checking npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is NOT installed!
    pause
    exit /b 1
) else (
    npm --version
    echo ✅ npm found
)
echo.

echo [3/6] Checking node_modules...
if exist "node_modules" (
    echo ✅ node_modules folder exists
) else (
    echo ❌ node_modules folder NOT found
    echo Run: npm install
)
echo.

echo [4/6] Checking key files...
if exist "package.json" (echo ✅ package.json) else (echo ❌ package.json MISSING)
if exist "next.config.js" (echo ✅ next.config.js) else (echo ❌ next.config.js MISSING)
if exist "tsconfig.json" (echo ✅ tsconfig.json) else (echo ❌ tsconfig.json MISSING)
if exist "app\page.tsx" (echo ✅ app\page.tsx) else (echo ❌ app\page.tsx MISSING)
if exist "app\layout.tsx" (echo ✅ app\layout.tsx) else (echo ❌ app\layout.tsx MISSING)
echo.

echo [5/6] Checking port 3000...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is already in use!
    echo You may need to use a different port: npm run dev -- -p 3001
) else (
    echo ✅ Port 3000 is available
)
echo.

echo [6/6] Attempting to verify Next.js installation...
if exist "node_modules\next" (
    echo ✅ Next.js is installed
) else (
    echo ❌ Next.js is NOT installed
    echo Run: npm install
)
echo.

echo ========================================
echo   Diagnostic Complete
echo ========================================
echo.
echo Next steps:
echo 1. If node_modules is missing: npm install
echo 2. Start server: npm run dev
echo 3. If port 3000 is busy: npm run dev -- -p 3001
echo.
pause











