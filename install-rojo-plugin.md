# Installing Rojo Plugin in Roblox Studio

## Problem
The automatic plugin installation failed because Rojo couldn't find Roblox Studio in the registry.

## Solution: Manual Installation

### Method 1: Install from Roblox Website (Easiest)

1. **Open Roblox Studio**
2. **Go to the Rojo Plugin page:**
   - Visit: https://www.roblox.com/library/1317044213/Rojo
   - Or search "Rojo" in the Roblox Toolbox
3. **Click "Get Plugin"** or "Add to Studio"
4. **The plugin will be installed automatically**

### Method 2: Manual File Installation

If Method 1 doesn't work:

1. **Download the plugin:**
   - Go to: https://www.roblox.com/library/1317044213/Rojo
   - Click "Download" (if available)
   - Or use: https://github.com/rojo-rbx/rojo/releases (look for plugin files)

2. **Find your Roblox Studio plugins folder:**
   - Press `Win + R`
   - Type: `%LOCALAPPDATA%\Roblox\Plugins`
   - Press Enter
   - This opens your Roblox Plugins folder (typically: `%LOCALAPPDATA%\Roblox\Plugins`)

3. **Copy the plugin file:**
   - If you downloaded a `.rbxm` or `.rbxl` file, copy it to the Plugins folder
   - Restart Roblox Studio

### Method 3: Install via Studio Toolbox

1. **Open Roblox Studio**
2. **Click "Toolbox" tab** (usually on the right side)
3. **Search for "Rojo"**
4. **Click on the Rojo plugin**
5. **Click "Add to Studio"**

## After Installation

1. **The Rojo button should appear** in Studio's toolbar (top menu bar)
2. **Click the Rojo button**
3. **Click "Connect"** in the dialog
4. **Make sure `rojo serve` is running** in your terminal

## Verify Installation

- Look for the Rojo icon/button in Studio's toolbar
- It should be near the Home, View, Model, etc. tabs
- If you don't see it, check View → Toolbars → make sure Rojo is enabled

## Troubleshooting

### Plugin doesn't appear after installation
- Restart Roblox Studio completely
- Check View → Toolbars → enable Rojo toolbar
- Reinstall the plugin using Method 1

### "Connection failed" when clicking Connect
- Make sure `rojo serve` is running in your terminal
- Check that the port matches (default: 34872)
- Try restarting both Rojo server and Studio

### Still can't find Roblox Studio
- Make sure Roblox Studio is installed from roblox.com
- Try reinstalling Roblox Studio
- Check if Studio is in a non-standard location
