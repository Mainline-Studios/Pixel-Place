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
    backgroundColor: '#0d1019',
    show: false // Don't show until ready
  });

  // Load the deployed app, localhost in development, or local Next.js build in production
  const isDev = process.env.NODE_ENV === 'development';
  
  let appUrl;
  if (isDev) {
    // Development: use localhost
    appUrl = 'http://localhost:3000';
    mainWindow.loadURL(appUrl);
    mainWindow.webContents.openDevTools();
    mainWindow.show();
  } else {
    // Production: try local Next.js server first, fallback to deployed URL
    const fs = require('fs');
    const nextBuildExists = fs.existsSync(path.join(__dirname, '.next'));
    
    if (nextBuildExists) {
      // Local production build - start Next.js server using node directly
      const { spawn } = require('child_process');
      
      // Try to start Next.js server using the bundled node
      try {
        // Use the system node to run next start
        const nextServer = spawn(process.execPath || 'node', [
          path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next'),
          'start'
        ], {
          cwd: __dirname,
          env: { ...process.env, PORT: '3000' },
          stdio: 'pipe'
        });

        nextServer.stdout.on('data', (data) => {
          console.log(`Next.js: ${data}`);
        });

        nextServer.stderr.on('data', (data) => {
          console.error(`Next.js error: ${data}`);
        });

        nextServer.on('error', (err) => {
          console.error('Failed to start Next.js server:', err);
          // Fallback to deployed URL
          appUrl = process.env.APP_URL || 'https://pixel-place.vercel.app';
          mainWindow.loadURL(appUrl);
          mainWindow.webContents.once('did-finish-load', () => {
            mainWindow.show();
            // Temporarily open DevTools for debugging
            mainWindow.webContents.openDevTools();
          });
        });

        // Wait for server to start
        setTimeout(() => {
          appUrl = 'http://localhost:3000';
          mainWindow.loadURL(appUrl);
          mainWindow.webContents.once('did-finish-load', () => {
            mainWindow.show();
            // Temporarily open DevTools for debugging
            mainWindow.webContents.openDevTools();
          });
          mainWindow.webContents.once('did-fail-load', (event, errorCode, errorDescription) => {
            console.error('Failed to load:', errorCode, errorDescription);
            // Fallback
            appUrl = process.env.APP_URL || 'https://pixel-place.vercel.app';
            mainWindow.loadURL(appUrl);
            mainWindow.webContents.once('did-finish-load', () => {
              mainWindow.show();
            });
          });
        }, 5000);
      } catch (err) {
        console.error('Error starting server:', err);
        appUrl = process.env.APP_URL || 'https://pixel-place.vercel.app';
        mainWindow.loadURL(appUrl);
        mainWindow.webContents.once('did-finish-load', () => {
          mainWindow.show();
        });
      }
    } else {
      // Fallback to deployed URL
      appUrl = process.env.APP_URL || 'https://pixel-place.vercel.app';
      mainWindow.loadURL(appUrl);
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.show();
        // Temporarily open DevTools for debugging
        mainWindow.webContents.openDevTools();
      });
    }
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

