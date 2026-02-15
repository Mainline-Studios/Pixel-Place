# Deploy Microsoft Branch to pixelplaceofficial.com

## Quick Deploy Steps

### 1. Make sure you're on the microsoft branch
```bash
git checkout microsoft
git pull origin microsoft  # If the branch exists on remote
```

### 2. Install dependencies (if needed)
```bash
npm install
```

### 3. Set production environment variables
Create or update `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://us-central1-pixel-place-823b1.cloudfunctions.net
NEXT_PUBLIC_BASE_URL=https://pixelplaceofficial.com
```

Or set them inline when building:
```bash
$env:NEXT_PUBLIC_API_URL="https://us-central1-pixel-place-823b1.cloudfunctions.net"; $env:NEXT_PUBLIC_BASE_URL="https://pixelplaceofficial.com"; npm run build
```

### 4. Build the project
```bash
npm run build
```
This creates the `out/` folder that Firebase will deploy.

### 5. Deploy to Firebase Hosting
```bash
# Make sure you're logged in
firebase login

# Deploy only hosting (faster)
firebase deploy --only hosting
```

Or use the combined script:
```bash
npm run deploy:hosting
```

### 6. Verify deployment
- Visit `https://pixelplaceofficial.com`
- The site should update within 1-2 minutes

## All-in-One Command (PowerShell)
```powershell
cd "C:\Users\Landon Boehm\Pixel-Place"
git checkout microsoft
npm install
$env:NEXT_PUBLIC_API_URL="https://us-central1-pixel-place-823b1.cloudfunctions.net"
$env:NEXT_PUBLIC_BASE_URL="https://pixelplaceofficial.com"
npm run build
firebase deploy --only hosting
```

## Push microsoft branch to GitHub (optional)
If you want to save the microsoft branch to GitHub:
```bash
git push origin microsoft
```

## Troubleshooting

### "firebase: command not found"
```bash
npm install -g firebase-tools
firebase login
```

### "Not logged in"
```bash
firebase login
```

### Build fails
- Make sure Node.js is installed: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Domain not updating
- Wait 1-2 minutes for Firebase to propagate changes
- Clear browser cache or use incognito mode
- Check Firebase Console → Hosting for deployment status
