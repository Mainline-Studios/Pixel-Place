# Change to script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pixel Place - Auto Deploy to Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying from: $scriptPath" -ForegroundColor Gray
Write-Host ""

Write-Host "[1/4] Installing Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Vercel CLI" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "[3/4] Building app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "[4/4] Logging into Vercel..." -ForegroundColor Yellow
vercel login
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Login failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "[5/5] Deploying to Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: You'll be asked to:" -ForegroundColor Cyan
Write-Host "  - Press Enter for all prompts" -ForegroundColor Cyan
Write-Host "  - Confirm deployment" -ForegroundColor Cyan
Write-Host ""
vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now live! Check the URL above." -ForegroundColor Cyan
Write-Host "Open it in Chrome/Edge to install the PWA." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
