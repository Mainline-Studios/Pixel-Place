# One-Command Deploy

## PowerShell Command (Run from Pixel-Place folder):

```powershell
cd "c:\Users\Landon Boehm\Pixel-Place"; npm install -g vercel; npm install; npm run build; vercel login; vercel --prod
```

## Or Run the Script (Auto-navigates to correct folder):

```powershell
cd "c:\Users\Landon Boehm\Pixel-Place"; .\DEPLOY.ps1
```

## Important:

**Make sure you're in the Pixel-Place folder!** The script now auto-navigates, but if running manually, always run from the project folder.

## First Time Setup:

1. Run the command above
2. When `vercel login` runs:
   - Browser opens
   - Login/register at Vercel
   - Authorize the CLI
3. When deploying:
   - Select your scope (e.g., "Laird Boehm's projects")
   - Press Enter for all prompts
   - Confirm deployment

## After Login:

Future deployments only need:
```powershell
cd "c:\Users\Landon Boehm\Pixel-Place"; npm run build; vercel --prod
```

## That's It!

The script will:
1. ✅ Navigate to correct folder
2. ✅ Install Vercel CLI
3. ✅ Install dependencies
4. ✅ Build your app
5. ✅ Login to Vercel (first time only)
6. ✅ Deploy to Vercel

## After Deployment:

1. Copy the URL (e.g., `https://pixel-place.vercel.app`)
2. Open it in Chrome/Edge
3. Click "Install" to add as PWA
4. Done! 🎉
