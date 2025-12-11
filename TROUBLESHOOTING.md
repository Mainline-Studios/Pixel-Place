# Troubleshooting - Localhost Not Running

## Quick Fixes

### 1. Install Dependencies
If you haven't installed dependencies yet:
```bash
npm install
```

### 2. Check if Port 3000 is Already in Use

**Windows:**
```bash
netstat -ano | findstr :3000
```
If something is using port 3000, either:
- Stop that process
- Or run on a different port: `npm run dev -- -p 3001`

**Kill process on port 3000 (Windows):**
```bash
# Find the PID from netstat, then:
taskkill /PID <process_id> /F
```

### 3. Check for Errors

Look at the terminal output when running `npm run dev`. Common errors:

**"Cannot find module"**
- Solution: Run `npm install` again

**"Port 3000 is already in use"**
- Solution: Use different port or kill the process

**TypeScript errors**
- Check the error message and fix the issue
- Or temporarily ignore: `npm run dev -- --no-lint`

### 4. Clear Cache and Reinstall

```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Try again
npm run dev
```

### 5. Check Node.js Version

Make sure you have Node.js 18 or higher:
```bash
node --version
```

If not, download from [nodejs.org](https://nodejs.org/)

### 6. Check for Missing Files

Make sure these files exist:
- `package.json`
- `next.config.js` (or `next.config.mjs`)
- `tsconfig.json`
- `app/layout.tsx`
- `app/page.tsx`

### 7. Environment Variables (Optional)

Stripe keys are optional for basic functionality. If you get Stripe errors, you can:
- Create `.env.local` with placeholder values:
```bash
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Or the app should still run without them (payments just won't work).

## Step-by-Step Debugging

1. **Open a new terminal/command prompt**
2. **Navigate to project folder:**
   ```bash
   cd "c:\Users\Landon Boehm\Pixel-Place"
   ```
3. **Check if node_modules exists:**
   ```bash
   dir node_modules
   ```
   If it doesn't exist or is empty, run `npm install`
4. **Try running the dev server:**
   ```bash
   npm run dev
   ```
5. **Look for error messages** in the terminal
6. **Check browser console** (F12) for client-side errors

## Common Error Messages

### "EADDRINUSE: address already in use :::3000"
- **Fix:** Port 3000 is busy. Use `npm run dev -- -p 3001` or kill the process

### "Cannot find module 'X'"
- **Fix:** Run `npm install` to install missing packages

### "Module not found: Can't resolve 'X'"
- **Fix:** Check if the import path is correct, or install the missing package

### "Type error: Property 'X' does not exist"
- **Fix:** TypeScript error - check the file mentioned in the error

## Still Not Working?

1. **Check the terminal output** - it usually tells you what's wrong
2. **Try a different port:**
   ```bash
   npm run dev -- -p 3001
   ```
   Then open: http://localhost:3001

3. **Check Windows Firewall** - it might be blocking Node.js

4. **Restart your computer** - sometimes helps with port issues

5. **Check if Next.js is installed:**
   ```bash
   npm list next
   ```
   If not, run `npm install next react react-dom`

## Getting Help

If none of these work, share:
1. The exact error message from the terminal
2. Your Node.js version (`node --version`)
3. Your npm version (`npm --version`)
4. The output of `npm run dev`
