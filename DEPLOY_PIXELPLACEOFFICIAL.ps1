# Deploy Pixel Place to pixelplaceofficial.com
# This script helps you deploy to Vercel with your custom domain

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY TO PIXELPLACEOFFICIAL.COM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "[1/5] Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Vercel CLI" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Write-Host "✓ Vercel CLI ready" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Write-Host "Please fix build errors and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Deploying to Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Make sure you have:" -ForegroundColor Cyan
Write-Host "  1. Added environment variables in Vercel Dashboard" -ForegroundColor Cyan
Write-Host "  2. Set up domain: pixelplaceofficial.com" -ForegroundColor Cyan
Write-Host "  3. Configured DNS records at your domain registrar" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment variables needed:" -ForegroundColor Yellow
Write-Host "  - NEXT_PUBLIC_BASE_URL=https://pixelplaceofficial.com" -ForegroundColor Gray
Write-Host "  - STRIPE_SECRET_KEY=sk_live_..." -ForegroundColor Gray
Write-Host "  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_..." -ForegroundColor Gray
Write-Host "  - STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to continue with deployment"

vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "[5/5] Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  NEXT STEPS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Go to Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Add domain 'pixelplaceofficial.com' in:" -ForegroundColor Yellow
Write-Host "   Settings → Domains" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Configure DNS at your domain registrar:" -ForegroundColor Yellow
Write-Host "   Add CNAME: @ → cname.vercel-dns.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Set up Stripe webhook:" -ForegroundColor Yellow
Write-Host "   https://pixelplaceofficial.com/api/webhook" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Verify your site:" -ForegroundColor Yellow
Write-Host "   https://pixelplaceofficial.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "See DEPLOY_TO_PIXELPLACEOFFICIAL.md for detailed instructions" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
