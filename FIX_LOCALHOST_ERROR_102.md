# Fix Error Code -102 (Connection Refused)

Error Code -102 means the browser cannot connect to `http://localhost:3000`. This happens when the Next.js development server is not running.

## Quick Fix:

1. **Open PowerShell or Command Prompt**

2. **Navigate to your project:**
   ```powershell
   cd "c:\Users\Landon Boehm\Pixel-Place"
   ```

3. **Start the server:**
   ```powershell
   npm run dev
   ```

4. **Wait for this message:**
   ```
   ▲ Next.js 14.x.x
   ✓ Ready in X seconds
   ○ Local:        http://localhost:3000
   ```

5. **Then open your browser to:**
   ```
   http://localhost:3000
   ```

## If Port 3000 is Busy:

Use a different port:
```powershell
npm run dev -- -p 3001
```

Then use: `http://localhost:3001`

## If Server Won't Start:

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Check Node.js version:**
   ```powershell
   node --version
   ```
   Should be v18 or higher.

3. **Kill any process using port 3000:**
   ```powershell
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

## The Error Means:

- ❌ Server is NOT running
- ✅ Solution: Run `npm run dev` first, THEN open the browser

**The server must be running before you can access the app!**












