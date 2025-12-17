# How to Run the Desktop App

## If you downloaded from GitHub Releases:

1. **Download the installer:**
   - Go to https://github.com/boehmlaird0/Pixel-Place/releases/latest
   - Download the `.dmg` file for macOS (or `.exe` for Windows, `.AppImage` for Linux)

2. **Install on macOS:**
   - Double-click the downloaded `.dmg` file
   - A window will open showing the Pixel Place app icon
   - Drag the "Pixel Place" app icon to your Applications folder
   - Open Applications folder and double-click "Pixel Place" to run it

3. **If macOS says the app is from an unidentified developer:**
   - Right-click the app in Applications
   - Select "Open"
   - Click "Open" in the security dialog
   - The app will now open normally

## If you built it locally:

After running `npm run electron:build:mac`, the built app will be in the `dist-electron` folder:

1. **Find the app:**
   - Open Finder
   - Navigate to `/Users/brennankelly/Pixel-Place/dist-electron/`
   - Look for `Pixel Place.app` (it looks like a single app icon, not a folder)

2. **Run the app:**
   - Double-click `Pixel Place.app` to launch it
   - Or drag it to your Applications folder for easier access

## Important Notes:

- **The `.app` file is NOT a folder** - even though it looks like one in Finder, it's actually a single application bundle
- **Don't open the `.app` contents** - if you right-click and select "Show Package Contents", you'll see the JSON files and source code, but you should just double-click the app itself
- **The app needs the `.next` build folder** - make sure you've run `npm run build` before building the desktop app, or the app won't have the built Next.js files

## Troubleshooting:

If the app doesn't open:
1. Make sure you've run `npm run build` first
2. Check that `dist-electron/Pixel Place.app` exists
3. Try running from terminal: `open "dist-electron/Pixel Place.app"`
