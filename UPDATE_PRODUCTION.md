# How to Update Production Site (pixelplaceofficial.com)

## Step 1: Find Your Project Directory
```bash
# On Mac, find where the Pixel-Place project is located
# Common locations:
cd ~/Desktop/Pixel-Place
# OR
cd ~/Documents/Pixel-Place
# OR
cd ~/Projects/Pixel-Place
# OR wherever you cloned it
```

## Step 2: Check Current Status
```bash
# See what directory you're in
pwd

# Check if this is a git repository
git status

# If you get "not a git repository", you're in the wrong folder
```

## Step 3: Pull Latest Changes
```bash
# Make sure you're in the Pixel-Place folder
cd /path/to/your/Pixel-Place

# Pull the latest code from GitHub
git pull origin main
```

## Step 4: If Git Pull Fails

### Option A: If you have uncommitted changes
```bash
# Save your changes first
git stash

# Then pull
git pull origin main

# Restore your changes (if needed)
git stash pop
```

### Option B: If you need to reset to match GitHub
```bash
# WARNING: This will discard local changes
git fetch origin
git reset --hard origin/main
```

## Step 5: Rebuild and Deploy

### If using Vercel:
```bash
# Install dependencies (if needed)
npm install

# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### If using another hosting service:
```bash
# Build the project
npm run build

# Then deploy using your hosting service's method
```

## Troubleshooting

### "Command not found: git"
- Install Git: `brew install git` or download from https://git-scm.com

### "Command not found: npm"
- Install Node.js: `brew install node` or download from https://nodejs.org

### "Permission denied"
- You might need to use `sudo` (but be careful)
- Or check file permissions: `ls -la`

### "Repository not found" or "Authentication failed"
- You might need to authenticate with GitHub
- Use: `git config --global user.name "Your Name"`
- Use: `git config --global user.email "your.email@example.com"`
- Or set up SSH keys for GitHub

### Find the correct path:
```bash
# Search for Pixel-Place folder
find ~ -name "Pixel-Place" -type d 2>/dev/null

# This will show you where the folder is located
```
