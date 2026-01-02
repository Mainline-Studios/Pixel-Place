# Commands to Locate PixelPlace

## Windows PowerShell/Command Prompt:

### Navigate to PixelPlace:
```powershell
cd "c:\Users\Landon Boehm\Pixel-Place"
```

### Check current location:
```powershell
pwd
# or
Get-Location
```

### Find PixelPlace from anywhere:
```powershell
Get-ChildItem -Path "c:\Users\Landon Boehm" -Filter "Pixel-Place" -Directory -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

### Open PixelPlace folder in File Explorer:
```powershell
explorer "c:\Users\Landon Boehm\Pixel-Place"
```

### Verify you're in the right folder:
```powershell
cd "c:\Users\Landon Boehm\Pixel-Place"
dir package.json
```

## Quick Navigation:

**From any location, use:**
```powershell
cd "c:\Users\Landon Boehm\Pixel-Place"
```

**Full Path:**
```
c:\Users\Landon Boehm\Pixel-Place
```

## Verify Location:

Once you're in the folder, verify with:
```powershell
# Check for key files
Test-Path package.json
Test-Path next.config.js
Test-Path app
```

All should return `True` if you're in the right place!

