@echo off
echo 🚀 Building Pixel Place Desktop App...
call npm run build
call npm run electron:build:win
if not exist "public\downloads" mkdir "public\downloads"
copy /Y "dist-electron\*.exe" "public\downloads\" >nul 2>&1
echo ✅ Done! Files in dist-electron\ and public\downloads\
pause
