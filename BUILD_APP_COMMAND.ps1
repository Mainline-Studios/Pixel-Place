# Build Desktop App Installer
cd "c:\Users\Landon Boehm\Pixel-Place"
npm install electron electron-builder --save-dev
npm run build
npm run electron:dist

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Installer location: dist-electron\Pixel Place Setup.exe" -ForegroundColor Yellow
Write-Host ""








