# Build Desktop App Installer
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILDING DESKTOP APP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Install Electron dependencies
Write-Host "[1/3] Installing Electron..." -ForegroundColor Yellow
npm install electron electron-builder --save-dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing Electron!" -ForegroundColor Red
    exit 1
}

# Update electron-main.js with actual Vercel URL (you'll need to update this)
Write-Host "[2/3] Building Next.js app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building app!" -ForegroundColor Red
    exit 1
}

# Build Electron app
Write-Host "[3/3] Creating Windows installer..." -ForegroundColor Yellow
npm run electron:dist
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building installer!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installer location: dist-electron\Pixel Place Setup.exe" -ForegroundColor Green
Write-Host ""
Write-Host "You can now distribute this installer file!" -ForegroundColor Yellow








