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
                    // TODO: Deploy to Vercel and update this URL
          // Run: npx vercel login && npx vercel --prod
          // Then replace this with your actual Vercel URL
          console.error('No deployment URL configured. Please deploy to Vercel first.');
          mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Pixel Place - Configuration Required</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: #0d1019;
                    color: #fff;
                    text-align: center;
                    padding: 20px;
                  }
                  .container {
                    max-width: 600px;
                  }
                  h1 { color: #4a9eff; }
                  code {
                    background: #1a1f2e;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                  }
                  .steps {
                    text-align: left;
                    margin: 20px 0;
                  }
                  .steps li {
                    margin: 10px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🚀 Pixel Place Desktop App</h1>
                  <p>This app needs to be configured with your Vercel deployment URL.</p>
                  <div class="steps">
                    <h3>To fix this:</h3>
                    <ol>
                      <li>Deploy your app to Vercel:<br>
                        <code>npx vercel login && npx vercel --prod</code>
                      </li>
                      <li>Copy your Vercel URL (e.g., <code>https://your-app.vercel.app</code>)</li>
                      <li>Open <code>electron-main.js</code> in the project</li>
                      <li>Replace all instances of this error page with your Vercel URL</li>
                      <li>Rebuild the app: <code>npm run electron:build:mac</code></li>
                    </ol>
                  </div>
                  <p style="margin-top: 30px; color: #888;">
                    Or use the web version at your deployed URL.
                  </p>
                </div>
              </body>
            </html>
          `));
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
                      // TODO: Deploy to Vercel and update this URL
          // Run: npx vercel login && npx vercel --prod
          // Then replace this with your actual Vercel URL
          console.error('No deployment URL configured. Please deploy to Vercel first.');
          mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Pixel Place - Configuration Required</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: #0d1019;
                    color: #fff;
                    text-align: center;
                    padding: 20px;
                  }
                  .container {
                    max-width: 600px;
                  }
                  h1 { color: #4a9eff; }
                  code {
                    background: #1a1f2e;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                  }
                  .steps {
                    text-align: left;
                    margin: 20px 0;
                  }
                  .steps li {
                    margin: 10px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🚀 Pixel Place Desktop App</h1>
                  <p>This app needs to be configured with your Vercel deployment URL.</p>
                  <div class="steps">
                    <h3>To fix this:</h3>
                    <ol>
                      <li>Deploy your app to Vercel:<br>
                        <code>npx vercel login && npx vercel --prod</code>
                      </li>
                      <li>Copy your Vercel URL (e.g., <code>https://your-app.vercel.app</code>)</li>
                      <li>Open <code>electron-main.js</code> in the project</li>
                      <li>Replace all instances of this error page with your Vercel URL</li>
                      <li>Rebuild the app: <code>npm run electron:build:mac</code></li>
                    </ol>
                  </div>
                  <p style="margin-top: 30px; color: #888;">
                    Or use the web version at your deployed URL.
                  </p>
                </div>
              </body>
            </html>
          `));
            mainWindow.webContents.once('did-finish-load', () => {
              mainWindow.show();
            });
          });
        }, 5000);
      } catch (err) {
        console.error('Error starting server:', err);
                  // TODO: Deploy to Vercel and update this URL
          // Run: npx vercel login && npx vercel --prod
          // Then replace this with your actual Vercel URL
          console.error('No deployment URL configured. Please deploy to Vercel first.');
          mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Pixel Place - Configuration Required</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: #0d1019;
                    color: #fff;
                    text-align: center;
                    padding: 20px;
                  }
                  .container {
                    max-width: 600px;
                  }
                  h1 { color: #4a9eff; }
                  code {
                    background: #1a1f2e;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                  }
                  .steps {
                    text-align: left;
                    margin: 20px 0;
                  }
                  .steps li {
                    margin: 10px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🚀 Pixel Place Desktop App</h1>
                  <p>This app needs to be configured with your Vercel deployment URL.</p>
                  <div class="steps">
                    <h3>To fix this:</h3>
                    <ol>
                      <li>Deploy your app to Vercel:<br>
                        <code>npx vercel login && npx vercel --prod</code>
                      </li>
                      <li>Copy your Vercel URL (e.g., <code>https://your-app.vercel.app</code>)</li>
                      <li>Open <code>electron-main.js</code> in the project</li>
                      <li>Replace all instances of this error page with your Vercel URL</li>
                      <li>Rebuild the app: <code>npm run electron:build:mac</code></li>
                    </ol>
                  </div>
                  <p style="margin-top: 30px; color: #888;">
                    Or use the web version at your deployed URL.
                  </p>
                </div>
              </body>
            </html>
          `));
        mainWindow.webContents.once('did-finish-load', () => {
          mainWindow.show();
        });
      }
    } else {
      // Fallback to deployed URL
                // TODO: Deploy to Vercel and update this URL
          // Run: npx vercel login && npx vercel --prod
          // Then replace this with your actual Vercel URL
          console.error('No deployment URL configured. Please deploy to Vercel first.');
          mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Pixel Place - Configuration Required</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: #0d1019;
                    color: #fff;
                    text-align: center;
                    padding: 20px;
                  }
                  .container {
                    max-width: 600px;
                  }
                  h1 { color: #4a9eff; }
                  code {
                    background: #1a1f2e;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                  }
                  .steps {
                    text-align: left;
                    margin: 20px 0;
                  }
                  .steps li {
                    margin: 10px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🚀 Pixel Place Desktop App</h1>
                  <p>This app needs to be configured with your Vercel deployment URL.</p>
                  <div class="steps">
                    <h3>To fix this:</h3>
                    <ol>
                      <li>Deploy your app to Vercel:<br>
                        <code>npx vercel login && npx vercel --prod</code>
                      </li>
                      <li>Copy your Vercel URL (e.g., <code>https://your-app.vercel.app</code>)</li>
                      <li>Open <code>electron-main.js</code> in the project</li>
                      <li>Replace all instances of this error page with your Vercel URL</li>
                      <li>Rebuild the app: <code>npm run electron:build:mac</code></li>
                    </ol>
                  </div>
                  <p style="margin-top: 30px; color: #888;">
                    Or use the web version at your deployed URL.
                  </p>
                </div>
              </body>
            </html>
          `));
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

