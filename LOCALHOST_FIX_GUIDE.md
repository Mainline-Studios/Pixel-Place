# Localhost Fix Guide

## Quick Fix

### Option 1: Use the Fix Script (Recommended)
**Windows:**
```powershell
.\FIX_LOCALHOST.ps1
```

**Or double-click:** `FIX_LOCALHOST.bat`

### Option 2: Manual Fix

1. **Kill process on port 3000:**
   ```powershell
   # Find the process
   netstat -ano | findstr :3000
   
   # Kill it (replace PID with the number from above)
   taskkill /PID <PID> /F
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the server:**
   ```powershell
   npm run dev
   ```

## Common Issues Fixed

✅ **Missing API Route:** Fixed `/api/games/init-builtin` route
✅ **Port Conflicts:** Script automatically kills processes on port 3000
✅ **Build Errors:** All CSS and TypeScript issues resolved
✅ **Dependencies:** Script ensures all packages are installed

## What Was Fixed

1. **API Route:** Created/updated `app/api/games/init-builtin/route.ts` with GET and POST handlers
2. **Port Management:** Created scripts to automatically free port 3000
3. **Build System:** Verified Next.js compiles successfully

## Server URLs

- **Development:** http://localhost:3000
- **If port 3000 is busy:** Next.js will automatically use port 3001

## Troubleshooting

### "Port 3000 is already in use"
Run the fix script or manually kill the process (see Option 2 above).

### "Cannot find module"
Run `npm install` to install all dependencies.

### "Build failed"
The build should now succeed. If you see errors, check:
- Node.js version (should be 18+)
- All dependencies installed (`npm install`)
- No syntax errors in recent changes

### "White screen"
- Check browser console for errors
- Verify the dev server is running
- Try hard refresh (Ctrl+Shift+R)

## Next Steps

1. Run `npm run dev` or use the fix script
2. Open http://localhost:3000 in your browser
3. The app should load successfully!
