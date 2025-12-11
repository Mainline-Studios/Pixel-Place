# Deploy to Vercel - Step by Step

## Prerequisites:
- Node.js installed
- Your app code ready

## Step 1: Install Vercel CLI

Open PowerShell and run:
```powershell
npm install -g vercel
```

## Step 2: Navigate to Your Project

```powershell
cd "c:\Users\Landon Boehm\Pixel-Place"
```

## Step 3: Build Your App

```powershell
npm run build
```

Wait for the build to complete. You should see:
```
✓ Compiled successfully
```

## Step 4: Deploy to Vercel

```powershell
vercel
```

**First time?** You'll be asked:
1. **Set up and deploy?** → Press `Enter` (Yes)
2. **Which scope?** → Press `Enter` (your account)
3. **Link to existing project?** → Press `Enter` (No, create new)
4. **Project name?** → Press `Enter` (use default: pixel-place)
5. **Directory?** → Press `Enter` (use current directory)

**After deployment**, you'll see:
```
✅ Production: https://pixel-place-xxxxx.vercel.app
```

## Step 5: Install the PWA

1. **Open the URL** in Chrome or Edge
2. **Look for the install icon** in the address bar (or the InstallPrompt component)
3. **Click "Install"**
4. **The app opens in its own window!**

## Updating Your App

When you make changes:

```powershell
npm run build
vercel --prod
```

Or use the deploy script:
```powershell
npm run deploy
```

## Troubleshooting

**Build fails?**
- Check for errors in the build output
- Make sure all dependencies are installed: `npm install`

**Service worker not working?**
- Make sure you're using HTTPS (Vercel provides this automatically)
- Check browser console for errors

**Install prompt not showing?**
- Make sure you're using Chrome/Edge
- Check that manifest.json is accessible
- Verify service worker is registered

## That's It!

Your app is now:
- ✅ Live on the internet
- ✅ Installable as a PWA
- ✅ Works offline
- ✅ Updates automatically

No Netlify needed! 🎉
