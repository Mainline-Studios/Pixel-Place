#!/bin/bash
# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

echo "🚀 Building Pixel Place Desktop App..."
echo "📁 Working directory: $(pwd)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the Pixel-Place directory."
    exit 1
fi

# Build Next.js
echo "📦 Building Next.js app..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Next.js build failed!"
    exit 1
fi

# Detect OS and build accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building for macOS..."
    npm run electron:build:mac
    if [ $? -eq 0 ]; then
        mkdir -p public/downloads
        cp dist-electron/*.dmg public/downloads/ 2>/dev/null || true
        cp dist-electron/*.zip public/downloads/ 2>/dev/null || true
        echo "✅ macOS build complete! Files copied to public/downloads/"
    else
        echo "❌ macOS build failed!"
        exit 1
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Building for Linux..."
    npm run electron:build:linux
    if [ $? -eq 0 ]; then
        mkdir -p public/downloads
        cp dist-electron/*.AppImage public/downloads/ 2>/dev/null || true
        cp dist-electron/*.deb public/downloads/ 2>/dev/null || true
        echo "✅ Linux build complete! Files copied to public/downloads/"
    else
        echo "❌ Linux build failed!"
        exit 1
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "🪟 Building for Windows..."
    npm run electron:build:win
    if [ $? -eq 0 ]; then
        mkdir -p public/downloads
        cp dist-electron/*.exe public/downloads/ 2>/dev/null || true
        echo "✅ Windows build complete! Files copied to public/downloads/"
    else
        echo "❌ Windows build failed!"
        exit 1
    fi
else
    echo "❌ Unknown OS: $OSTYPE"
    exit 1
fi

echo ""
echo "✅ Done! Desktop app files are ready:"
echo "   📦 Original builds: dist-electron/"
echo "   🌐 Web downloads: public/downloads/"
echo ""
echo "📝 Next steps:"
echo "   1. Test the app from dist-electron/"
echo "   2. Commit and push public/downloads/ to make downloads available on the website"
