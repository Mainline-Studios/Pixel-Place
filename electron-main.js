const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'public', 'icon-512x512.png'),
    titleBarStyle: 'default',
    backgroundColor: '#0d1019'
  });

  // Load the deployed app, localhost in development, or local Next.js build in production
  const isDev = process.env.NODE_ENV === 'development';
  
  let appUrl;
  if (isDev) {
    // Development: use localhost
    appUrl = 'http://localhost:3000';
  } else {
    // Production: try local Next.js server first, fallback to deployed URL
    const fs = require('fs');
    const nextBuildExists = fs.existsSync(path.join(__dirname, '.next'));
    
    if (nextBuildExists) {
      // Local production build - start Next.js server
      const { spawn } = require('child_process');
      const nextServer = spawn('npm', ['start'], {
        cwd: __dirname,
        shell: true,
        stdio: 'ignore'
      });
      
      // Wait for server to start
      setTimeout(() => {
        appUrl = 'http://localhost:3000';
        mainWindow.loadURL(appUrl);
      }, 3000);
      return;
    } else {
      // Fallback to deployed URL (update with your actual deployment URL)
      appUrl = process.env.APP_URL || 'https://YOUR_VERCEL_URL_HERE.vercel.app';
    }
  }

  mainWindow.loadURL(appUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

