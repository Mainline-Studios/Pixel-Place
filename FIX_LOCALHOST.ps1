# Fix Localhost Issues Script
Write-Host "=== Fixing Localhost Issues ===" -ForegroundColor Cyan
Write-Host ""

# Check if port 3000 is in use
Write-Host "Checking port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "Port 3000 is in use. Killing process..." -ForegroundColor Yellow
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Killed process $pid" -ForegroundColor Green
        } catch {
            Write-Host "Could not kill process $pid" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "Port 3000 is free." -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting dev server..." -ForegroundColor Yellow
Write-Host "The server will start on http://localhost:3000" -ForegroundColor Cyan
Write-Host "If port 3000 is still in use, Next.js will automatically use port 3001" -ForegroundColor Cyan
Write-Host ""

npm run dev
