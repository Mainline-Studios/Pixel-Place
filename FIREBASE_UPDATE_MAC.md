# Update Production Site on Firebase (Mac)

## Step 1: Find Your Pixel-Place Folder

```bash
# Search for the Pixel-Place folder
find ~ -name "Pixel-Place" -type d 2>/dev/null
```

## Step 2: Navigate to the Folder

```bash
# Replace with the actual path from Step 1
cd ~/Desktop/Pixel-Place
# OR wherever it was found
```

## Step 3: Pull Latest Code from GitHub

```bash
# Check if it's a git repository
git status

# If "not a git repository", clone it first:
# cd ~/Desktop
# git clone https://github.com/boehmlaird0/Pixel-Place.git
# cd Pixel-Place

# Pull the latest changes
git pull origin main
```

## Step 4: Install Dependencies (if needed)

```bash
npm install
```

## Step 5: Build the Project

```bash
npm run build
```

This creates the `out/` folder that Firebase will deploy.

## Step 6: Deploy to Firebase Hosting

```bash
# Make sure you're logged into Firebase
firebase login

# Deploy only hosting (faster)
firebase deploy --only hosting

# OR deploy everything (hosting + functions)
firebase deploy
```

## Quick One-Liner

```bash
cd ~/Desktop/Pixel-Place && git pull origin main && npm install && npm run build && firebase deploy --only hosting
```

## Troubleshooting

### "firebase: command not found"
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Then login
firebase login
```

### "Not logged in"
```bash
firebase login
```

### "Build failed"
```bash
# Make sure Node.js is installed
node --version

# If not, install it:
brew install node
```

### "Permission denied"
```bash
# You might need to use sudo (be careful)
sudo npm install -g firebase-tools
```

## Verify Deployment

After deploying, check:
- https://pixelplaceofficial.com
- https://pixel-place-823b1.web.app

Changes should be live within 1-2 minutes.
