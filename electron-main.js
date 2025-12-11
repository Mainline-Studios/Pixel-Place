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

  // Load the deployed app or localhost in development
  const isDev = process.env.NODE_ENV === 'development';
  // IMPORTANT: After deploying to Vercel, update this URL with your actual deployment URL
  const appUrl = isDev
    ? 'http://localhost:3000'
    : 'https://YOUR_VERCEL_URL_HERE.vercel.app'; // Replace with your Vercel URL after deployment

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

