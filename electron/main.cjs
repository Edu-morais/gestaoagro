const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
// const isDev = require('electron-is-dev'); // Optional: check if dev mode if needed, or use env vars

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // Optional if you need it later
    },
  });

  // In development, load the local server.
  // In production, load the built index.html from the dist folder.
  const startUrl = process.env.ELECTRON_START_URL || 
    `file://${path.join(__dirname, '../dist/index.html')}`;

  win.loadURL(startUrl);

  // Open DevTools in development
  if (process.env.ELECTRON_START_URL) {
    win.webContents.openDevTools();
  }
}

// Setup Content Security Policy (CSP)
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.protocol !== 'file:') {
       // event.preventDefault(); // Uncomment to lock down navigation
    }
  });
});

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
