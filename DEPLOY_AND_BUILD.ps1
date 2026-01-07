# Deploy Pixel Place to Vercel and Build Desktop App
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PIXEL PLACE - DEPLOY & BUILD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
Write-Host "[1/4] Navigated to project directory" -ForegroundColor Green

# Step 2: Install dependencies
Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing dependencies!" -ForegroundColor Red
    exit 1
}

# Step 3: Build Next.js app
Write-Host "[3/4] Building Next.js app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building app!" -ForegroundColor Red
    exit 1
}

# Step 4: Deploy to Vercel
Write-Host "[4/4] Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "You will need to login to Vercel if not already logged in." -ForegroundColor Yellow
npm install -g vercel
vercel login
vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app URL will be shown above (e.g., https://pixel-place.vercel.app)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next: Build the desktop app installer:" -ForegroundColor Cyan
Write-Host "  npm install electron electron-builder" -ForegroundColor White
Write-Host "  npm run electron:dist" -ForegroundColor White
Write-Host ""
Write-Host "The installer will be in the 'dist-electron' folder!" -ForegroundColor Green










