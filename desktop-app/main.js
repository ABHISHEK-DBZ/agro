const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    show: false, // Don't show until ready
    titleBarStyle: 'default',
    autoHideMenuBar: false
  });

  // Load the app
  const APP_URL = 'https://claimbot-chi.vercel.app';
  
  // Check if we're in development mode
  const isDev = process.argv.includes('--dev');
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3002');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(APP_URL);
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external websites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'https://claimbot-chi.vercel.app' && 
        parsedUrl.origin !== 'http://localhost:3002') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Handle page title updates
  mainWindow.on('page-title-updated', (event, title) => {
    event.preventDefault();
    mainWindow.setTitle(`Smart Krishi Sahayak - ${title}`);
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'Smart Krishi Sahayak',
      submenu: [
        {
          label: 'About Smart Krishi Sahayak',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Smart Krishi Sahayak',
              message: 'Smart Krishi Sahayak v1.0.0',
              detail: 'Agriculture Assistant for Indian Farmers\n\nFeatures:\n• Live Weather Data\n• AI Agriculture Assistant\n• Crop Disease Detection\n• Market Prices\n• Government Schemes\n\nDeveloped by ABHISHEK-DBZ'
            });
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Quit Smart Krishi Sahayak' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload App' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Reset Zoom' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Fullscreen' }
      ]
    },
    {
      label: 'Features',
      submenu: [
        {
          label: 'Live Weather',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.location.hash = '#/weather';
            `);
          }
        },
        {
          label: 'AI Agent',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.location.hash = '#/ai-agent';
            `);
          }
        },
        {
          label: 'Disease Detection',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.location.hash = '#/disease-detection';
            `);
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Visit Website',
          click: () => {
            shell.openExternal('https://claimbot-chi.vercel.app');
          }
        },
        {
          label: 'GitHub Repository',
          click: () => {
            shell.openExternal('https://github.com/ABHISHEK-DBZ/agro');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('platform-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.getSystemVersion()
  };
});
