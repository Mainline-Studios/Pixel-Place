# Rojo Setup Guide for Pixel Place

## Problem: Aftman Installation Error

If you're getting an error like:
```
'C:\Users\Landon' is not recognized as an internal or external command
```

This is because Aftman has trouble with spaces in Windows usernames.

## Solution: Install Rojo Directly via npm

### Method 1: Use the Batch Script (Easiest)

1. **Double-click** `install-rojo.bat` in the project folder
2. Wait for installation to complete
3. Done!

### Method 2: Manual Installation

1. **Open PowerShell or Command Prompt**
2. **Run:**
   ```powershell
   npm install -g rojo
   ```
3. **Verify installation:**
   ```powershell
   rojo --version
   ```

### Method 3: Download Pre-built Binary (If npm doesn't work)

1. **Download Rojo from GitHub:**
   - Go to: https://github.com/rojo-rbx/rojo/releases
   - Download the latest `rojo-windows.zip`
   - Extract to a folder (e.g., `C:\rojo`)
   - Add that folder to your system PATH

## Using Rojo with Pixel Place

### Step 1: Start the Rojo Server

**Option A: Using the batch file (coming soon)**
- Double-click `start-rojo.bat`

**Option B: Manual command**
```powershell
cd "Pixel-Place"  # or navigate to your Pixel-Place project folder
rojo serve
```

You should see:
```
Rojo server listening on 127.0.0.1:34872
```

### Step 2: Connect in Roblox Studio

1. **Open Roblox Studio**
2. **Install the Rojo plugin** (if not already installed):
   - Go to: https://www.roblox.com/library/1317044213/Rojo
   - Click "Get Plugin"
3. **Click the Rojo button** in Studio's toolbar
4. **Click "Connect"** in the dialog
5. Your files will sync automatically!

## Project Structure

The `default.project.json` file maps your project like this:

- `lib/` → ReplicatedStorage/Shared
- `server/` → ServerScriptService/Server  
- `components/` → StarterPlayer/StarterPlayerScripts/Client
- `components/Games/` → Workspace/Games

## Troubleshooting

### "rojo is not recognized"
- Make sure Rojo is installed: `npm install -g rojo`
- Restart your terminal/VS Code
- Check PATH: `where rojo`

### "Port 34872 is already in use"
- Another Rojo server is running
- Close it or change the port in `default.project.json`

### "Connection failed"
- Make sure `rojo serve` is running
- Check that the port matches (default: 34872)
- Try restarting both Rojo and Roblox Studio

## VS Code Extension

The Rojo extension button should appear automatically once `default.project.json` exists.

If it doesn't:
1. Reload VS Code window (Ctrl+Shift+P → "Reload Window")
2. Check that the extension is enabled
3. Verify `default.project.json` is in the workspace root
