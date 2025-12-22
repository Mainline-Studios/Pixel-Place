# PowerShell script to create a shareable zip of Pixel Place
# Excludes node_modules, .next, and other unnecessary files

$projectName = "Pixel-Place"
$zipName = "Pixel-Place-Shareable.zip"

# Files and folders to exclude
$excludeItems = @(
    "node_modules",
    ".next",
    ".git",
    "*.log",
    ".DS_Store",
    "Thumbs.db"
)

Write-Host "Creating shareable zip file..." -ForegroundColor Green

# Get the current directory
$currentDir = Get-Location

# Create temporary directory
$tempDir = Join-Path $env:TEMP "pixel-place-share"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy all files except excluded ones
Write-Host "Copying files..." -ForegroundColor Yellow
Get-ChildItem -Path $currentDir -Recurse | Where-Object {
    $exclude = $false
    foreach ($pattern in $excludeItems) {
        if ($_.FullName -like "*\$pattern\*" -or $_.Name -like $pattern) {
            $exclude = $true
            break
        }
    }
    return -not $exclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($currentDir.Path.Length + 1)
    $destPath = Join-Path $tempDir $relativePath
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    Copy-Item $_.FullName -Destination $destPath -Force
}

# Create zip file
$zipPath = Join-Path $currentDir $zipName
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host "Compressing files..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "`nShareable zip created: $zipPath" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Upload $zipName to Google Drive" -ForegroundColor White
Write-Host "2. Right-click the file in Google Drive" -ForegroundColor White
Write-Host "3. Click 'Share' and enter the recipient's email" -ForegroundColor White
Write-Host "4. They can download and extract the zip file" -ForegroundColor White
Write-Host "5. They need to run: npm install" -ForegroundColor White
Write-Host "6. Then run: npm run dev" -ForegroundColor White






