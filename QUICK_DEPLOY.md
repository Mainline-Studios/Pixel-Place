# Quick Deploy Guide - Pixel Place PWA

## Fastest Way to Deploy (5 minutes):

### Step 1: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 2: Build Your App
```powershell
cd "c:\Users\Landon Boehm\Pixel-Place"
npm run build
```

### Step 3: Deploy
```powershell
vercel
```

**Follow the prompts:**
- Press Enter to set up and deploy
- Press Enter to link to existing project (or create new)
- Press Enter to use default settings
- Your app will be deployed to: `https://pixel-place-xxxxx.vercel.app`

### Step 4: Install the App

1. **On Desktop:**
   - Open the Vercel URL in Chrome/Edge
   - Click the install icon in the address bar
   - Or use the InstallPrompt that appears

2. **On Mobile:**
   - Open the Vercel URL in Chrome
   - Tap menu → "Install app" or "Add to Home screen"

## Alternative: Use Netlify

### Step 1: Install Netlify CLI
```powershell
npm install -g netlify-cli
```

### Step 2: Deploy
```powershell
npm run build
netlify deploy --prod
```

## What You Get:

✅ **HTTPS URL** (required for PWA)  
✅ **Installable app** (works like native app)  
✅ **Offline support** (cached content works offline)  
✅ **Auto-updates** (when you redeploy)  
✅ **Works on all devices** (desktop, mobile, tablet)

## After Deployment:

Your app will be accessible at a URL like:
- `https://pixel-place.vercel.app` (Vercel)
- `https://pixel-place.netlify.app` (Netlify)

Users can install it directly from their browser - no app store needed!

## Update Your App:

When you make changes:
```powershell
npm run build
vercel --prod
```

Or after `npm run build`:
```powershell
vercel --prod
```

*(Firebase: `firebase deploy` / `npm run deploy` runs a fresh `next build` before Hosting upload; `npm run deploy:full` deploys hosting + functions.)*
