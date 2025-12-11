# Download and Install Pixel Place Desktop App
# This script downloads the installer and runs it

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PIXEL PLACE - DOWNLOAD & INSTALL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# IMPORTANT: Update this URL after you deploy and build the installer
# You'll need to host the installer file somewhere (GitHub Releases, Dropbox, etc.)
$installerUrl = "https://YOUR_URL_HERE/Pixel-Place-Setup.exe"
$downloadPath = "$env:USERPROFILE\Downloads\Pixel-Place-Setup.exe"

Write-Host "Downloading Pixel Place installer..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $installerUrl -OutFile $downloadPath -UseBasicParsing
    Write-Host "Download complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting installer..." -ForegroundColor Yellow
    Start-Process -FilePath $downloadPath -Wait
    Write-Host ""
    Write-Host "Installation complete! Look for 'Pixel Place' in your Start Menu." -ForegroundColor Green
} catch {
    Write-Host "Error downloading installer: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please update the installerUrl in this script with your actual download URL." -ForegroundColor Yellow
}

