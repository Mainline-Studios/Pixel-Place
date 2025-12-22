#!/bin/bash
# Fix macOS "damaged" app error by removing quarantine attribute

echo "🔧 Fixing Pixel Place app..."
echo ""

# Check if app is in Downloads
if [ -d ~/Downloads/"Pixel Place.app" ]; then
    APP_PATH=~/Downloads/"Pixel Place.app"
elif [ -d ~/Desktop/"Pixel Place.app" ]; then
    APP_PATH=~/Desktop/"Pixel Place.app"
elif [ -d /Applications/"Pixel Place.app" ]; then
    APP_PATH=/Applications/"Pixel Place.app"
else
    echo "❌ Pixel Place.app not found in Downloads, Desktop, or Applications"
    echo "Please drag the app to one of these locations first, then run this script again."
    exit 1
fi

echo "Found app at: $APP_PATH"
echo ""
echo "Removing quarantine attribute..."
xattr -cr "$APP_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Success! The app should now open without the 'damaged' error."
    echo ""
    echo "You can now:"
    echo "1. Double-click the app to open it"
    echo "2. Or right-click and select 'Open'"
else
    echo "❌ Error removing quarantine attribute"
    exit 1
fi
