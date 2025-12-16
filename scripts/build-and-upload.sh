#!/bin/bash
echo "🚀 Building Pixel Place Desktop App..."
npm run build
if [[ "$OSTYPE" == "darwin"* ]]; then
    npm run electron:build:mac
    mkdir -p public/downloads
    cp dist-electron/*.dmg public/downloads/ 2>/dev/null || true
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    npm run electron:build:linux
    mkdir -p public/downloads
    cp dist-electron/*.AppImage public/downloads/ 2>/dev/null || true
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    npm run electron:build:win
    mkdir -p public/downloads
    cp dist-electron/*.exe public/downloads/ 2>/dev/null || true
fi
echo "✅ Done! Files in dist-electron/ and public/downloads/"
