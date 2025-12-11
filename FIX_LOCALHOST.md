# Fix Localhost Not Running

## Quick Fix (Try This First!)

1. **Open PowerShell or Command Prompt**

2. **Navigate to your project:**
   ```powershell
   cd "c:\Users\Landon Boehm\Pixel-Place"
   ```

3. **Install dependencies (if not done):**
   ```powershell
   npm install
   ```
   Wait for it to finish (may take 2-5 minutes)

4. **Start the server:**
   ```powershell
   npm run dev
   ```

5. **Wait for this message:**
   ```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   ```

6. **Open your browser and go to:**
   ```
   http://localhost:3000
   ```

## If Port 3000 is Busy

**Option 1: Use a different port**
```powershell
npm run dev -- -p 3001
```
Then open: http://localhost:3001

**Option 2: Kill the process using port 3000**

In PowerShell:
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with the number from above)
taskkill /PID <PID> /F
```

## If You See Errors

### Error: "Cannot find module"
**Fix:** Run `npm install` again

### Error: "Port 3000 is already in use"
**Fix:** Use `npm run dev -- -p 3001` or kill the process

### Error: "Missing dependencies"
**Fix:** 
```powershell
npm install
```

### Error: "TypeScript errors"
**Fix:** The error message will tell you which file. Check that file for issues.

## Still Not Working?

1. **Check if Node.js is installed:**
   ```powershell
   node --version
   ```
   Should show v18 or higher. If not, install from [nodejs.org](https://nodejs.org/)

2. **Clear everything and reinstall:**
   ```powershell
   # Delete node_modules
   Remove-Item -Recurse -Force node_modules
   
   # Delete package-lock.json
   Remove-Item -Force package-lock.json
   
   # Reinstall
   npm install
   
   # Try again
   npm run dev
   ```

3. **Check the terminal output** - it usually shows the exact error

## Common Issues

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installing

### "EADDRINUSE" error
- Port 3000 is already in use
- Use `npm run dev -- -p 3001` instead

### Blank page or connection refused
- Server might not have started
- Check terminal for errors
- Make sure you see "Ready" message

### Browser shows "This site can't be reached"
- Server isn't running
- Check terminal for errors
- Make sure you're using the correct URL (http://localhost:3000)

## Need More Help?

Share the **exact error message** from your terminal when you run `npm run dev`
