const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'database.json');

// IPC Handlers for Local Database
ipcMain.handle('get-data', async () => {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    }
    return null; // Return null if file doesn't exist
  } catch (error) {
    console.error('Error reading database:', error);
    throw error;
  }
});

ipcMain.handle('save-data', async (event, data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Error saving database:', error);
    throw error;
  }
});

// Auto-Updater Handlers
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});
// const isDev = require('electron-is-dev'); // Optional: check if dev mode if needed, or use env vars

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'AgroSistem',
    icon: path.join(__dirname, '../public/logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
      // preload: path.join(__dirname, 'preload.js') // Optional if you need it later
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

  // Update Events
  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  autoUpdater.on('update-available', () => {
    win.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded');
  });
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
