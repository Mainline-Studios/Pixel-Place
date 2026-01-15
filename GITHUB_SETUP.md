# GitHub Account Setup for Auto-Deployment

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click "+" → "New repository"
3. Name it: `pixel-place`
4. Set to **Private** (or Public if you prefer)
5. **Don't** initialize with README
6. Click "Create repository"

## Step 2: Connect Local Project to GitHub

Run these commands in PowerShell:

```powershell
cd "c:\Users\Landon Boehm\Pixel-Place"
git init
git add .
git commit -m "Initial commit - Pixel Place PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pixel-place.git
git push -u origin main
```

(Replace `YOUR_USERNAME` with your GitHub username)

## Step 3: Connect to Vercel for Auto-Deploy

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Click "Deploy"

**Now every time you push to GitHub, Vercel auto-deploys!**

## Step 4: Future Updates

After making changes:

```powershell
git add .
git commit -m "Your update message"
git push
```

Vercel automatically deploys the new version!

















