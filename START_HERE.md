# How to Start Pixel Place

## 🚀 Quick Start (Any Computer)

### 1. Download Node.js
- Go to: **https://nodejs.org/**
- Download and install the **LTS** version

### 2. Open Terminal/Command Prompt and run:
```bash
git clone https://github.com/boehmlaird0/Pixel-Place.git
cd Pixel-Place
npm install
npm run dev
```

### 3. Open your browser:
- Go to: **http://localhost:3000**

---

## ⚠️ IMPORTANT: You Need Node.js First!

The app **cannot run** without Node.js installed. Here's how to fix it:

### Step 1: Install Node.js

1. Go to **https://nodejs.org/**
2. Click the green **"LTS"** button (Long Term Support version)
3. Download and run the installer
4. **Restart your computer** after installation

### Step 2: Verify Installation

Open PowerShell and run:
```powershell
node --version
npm --version
```

If both commands show version numbers, Node.js is installed correctly!

### Step 3: Start the App

**Option A: Using the batch file (Windows)**
- Double-click `start-server.bat`

**Option B: Using PowerShell**
```powershell
npm install
npm run dev
```

### Step 4: Open in Browser

Once the server starts, open:
**http://localhost:3000**

---

## Troubleshooting

**"node is not recognized"**
- Node.js is not installed or not in PATH
- Restart your computer after installing Node.js
- Make sure you downloaded from nodejs.org (official site)

**"ERR_CONNECTION_REFUSED"**
- The server is not running
- Make sure you ran `npm run dev` and see "Ready" message
- Check that port 3000 is not being used by another app

**Port 3000 already in use**
- Close other apps using port 3000
- Or run: `npm run dev -- -p 3001` (uses port 3001 instead)

---

## Need Help?

If Node.js is installed but still not working:
1. Restart your computer
2. Open a NEW PowerShell window
3. Navigate to the project folder
4. Try the commands again




