# Update Production Site - Mac Instructions

## Step 1: Find Your Pixel-Place Folder

Open Terminal on Mac and run:

```bash
# Search for the Pixel-Place folder
find ~ -name "Pixel-Place" -type d 2>/dev/null
```

This will show you where the folder is located. Common locations:
- `~/Desktop/Pixel-Place`
- `~/Documents/Pixel-Place`
- `~/Projects/Pixel-Place`

## Step 2: Navigate to the Folder

```bash
# Replace with the actual path from Step 1
cd ~/Desktop/Pixel-Place
# OR wherever it was found
```

## Step 3: Check if it's a Git Repository

```bash
# Check git status
git status
```

**If you see "not a git repository":**
You need to clone the repository first:
```bash
cd ~/Desktop  # or wherever you want it
git clone https://github.com/boehmlaird0/Pixel-Place.git
cd Pixel-Place
```

## Step 4: Pull Latest Changes

```bash
# Make sure you're in the Pixel-Place folder
pwd  # This shows your current directory

# Pull the latest code
git pull origin main
```

**If git pull fails with "uncommitted changes":**
```bash
# Save your local changes
git stash

# Pull again
git pull origin main
```

**If git pull fails with "authentication":**
The repository might be private. You may need to:
- Use SSH instead: `git remote set-url origin git@github.com:boehmlaird0/Pixel-Place.git`
- Or authenticate with GitHub

## Step 5: Rebuild and Deploy

### If using Vercel (most common):

```bash
# Make sure you have Node.js installed
node --version

# Install dependencies
npm install

# Build the project
npm run build

# Deploy to production
vercel --prod
```

**If vercel command not found:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Then deploy
vercel --prod
```

### If using a different hosting service:
Follow their deployment instructions after running `npm run build`

## Quick One-Liner (if you know the path):

```bash
cd ~/Desktop/Pixel-Place && git pull origin main && npm install && npm run build && vercel --prod
```

## Still Having Issues?

1. **Check what error message you got** - share it and I can help fix it
2. **Verify you're in the right folder**: `pwd` and `ls` to see files
3. **Check if git is installed**: `git --version`
4. **Check if node is installed**: `node --version`
