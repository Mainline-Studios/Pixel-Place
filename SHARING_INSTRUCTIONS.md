# How to Share Pixel Place

## Quick Share via Google Drive

### Step 1: Create Shareable Zip
Run this command in PowerShell (in the project folder):
```powershell
.\create-shareable-zip.ps1
```

Or manually:
1. Right-click the project folder
2. Select "Send to" > "Compressed (zipped) folder"
3. **IMPORTANT**: Before sharing, delete `node_modules` and `.next` folders (they're too large)

### Step 2: Upload to Google Drive
1. Go to [Google Drive](https://drive.google.com)
2. Click "New" > "File upload"
3. Select the zip file
4. Right-click the uploaded file > "Share"
5. Enter the recipient's email address
6. Set permissions to "Editor" or "Viewer"
7. Click "Send"

### Step 3: Recipient Instructions
The person receiving the file should:
1. Download the zip from Google Drive
2. Extract it to a folder
3. Open terminal/command prompt in that folder
4. Run: `npm install`
5. Run: `npm run dev`
6. Open browser to `http://localhost:3000`

---

## Better Option: Deploy Online (Recommended)

### Deploy to Vercel (Free & Easy)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository (or drag & drop the folder)
5. Click "Deploy"
6. Share the URL (e.g., `your-project.vercel.app`)

### Deploy to Netlify (Free & Easy)
1. Go to [netlify.com](https://netlify.com)
2. Sign up
3. Drag & drop your project folder
4. Share the URL (e.g., `your-project.netlify.app`)

---

## Share via GitHub
1. Create a GitHub account at [github.com](https://github.com)
2. Create a new repository
3. Upload your code
4. Share the repository link

---

## What to Include/Exclude

### ✅ Include:
- All source code files (`.tsx`, `.ts`, `.js`, `.jsx`)
- `package.json`
- `next.config.js`
- `tsconfig.json`
- `app/` folder
- `components/` folder
- `lib/` folder
- `public/` folder
- `README.md`

### ❌ Exclude (too large):
- `node_modules/` (will be recreated with `npm install`)
- `.next/` (build folder, will be recreated)
- `.git/` (if using Git)
- `*.log` files

---

## Need Help?
If you need help with any of these steps, let me know!








