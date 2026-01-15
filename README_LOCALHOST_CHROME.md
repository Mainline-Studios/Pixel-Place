# Quick Access to Localhost

## Open Localhost in Chrome

### Option 1: Double-click the batch file
- Double-click `open-localhost.bat` to open http://localhost:3000 in Chrome

### Option 2: Use PowerShell
- Right-click `open-localhost.ps1` → Run with PowerShell

### Option 3: Create Chrome Shortcut
1. Right-click on your desktop
2. Select "New" → "Shortcut"
3. Enter this location:
   ```
   chrome.exe http://localhost:3000
   ```
4. Name it "Pixel Place Localhost"
5. Click Finish

### Option 4: Pin to Chrome Bookmarks
1. Open Chrome
2. Go to http://localhost:3000
3. Press `Ctrl+D` to bookmark
4. Name it "Pixel Place Dev"
5. You can also drag it to your bookmarks bar for quick access

### Option 5: Add to Chrome Apps
1. Open Chrome
2. Go to http://localhost:3000
3. Click the three dots menu (⋮) → More tools → Create shortcut
4. Check "Open as window" if you want it as a separate app
5. Click "Create"

## Make sure the dev server is running first!
Run `npm run dev` before opening localhost.
