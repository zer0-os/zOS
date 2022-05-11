// Module to control the application lifecycle and the native browser window.

const { app, BrowserWindow, protocol, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let zChainServerWindow = null;
let appWindow = null;

// Create the native browser window.
function createWindow() {
  appWindow = new BrowserWindow({
    // Set the path of an additional "preload" script that can be used to
    // communicate between node-land and browser-land.
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  appWindow.maximize();

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    : 'http://localhost:3000';

  appWindow.loadURL(appURL);

  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    appWindow.webContents.openDevTools();
  }
}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizerProxy() {
  protocol.registerHttpProtocol(
    'file',
    (request, callback) => {
      const url = request.url.substr(8);
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    },
    (error) => {
      if (error) console.error('Failed to register protocol');
    }
  );
}

function startServer() {
  return new Promise(resolve => {
    // XXX - this is somewhat temporary to support passing console messages
    // from the hidden renderer.
    const remoteMain = require('@electron/remote/main');

    const win = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    remoteMain.initialize();
    remoteMain.enable(win.webContents);

    let zChainServerPath = url.format({
      pathname: path.join(__dirname, 'zchainserver.html'),
      protocol: 'file:',
      slashes: true,
    });

    // if (process.env.NODE_ENV === 'development') {
    //   zChainServerPath = `file:///${process.cwd()}/.webpack/main/ssbserver.html`;
    // }

    win.loadURL(zChainServerPath);

    win.webContents.on('did-finish-load', () => {
      resolve(win);
    });
  });
}

function setupIpcHandlers() {
  ipcMain.on('startZChainServer', async (_event) => {
    zChainServerWindow = await startServer();

    if (isRunning(appWindow)) {
      appWindow.webContents.send('ZChainServerStarted');
    }
  });

  ipcMain.on('zchain-ipc-transport-main', (_event, data) => {
    isRunning(zChainServerWindow) && zChainServerWindow.webContents.send('zchain-ipc-transport-main', data);
  });

  ipcMain.on('zchain-ipc-transport-renderer', (_event, data) => {
    isRunning(appWindow) && appWindow.webContents.send('zchain-ipc-transport-renderer', data);
  });
}

function isRunning(win) {
  return win && !win.isDestroyed();
}

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  setupIpcHandlers();

  createWindow();
  setupLocalFilesNormalizerProxy();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
const allowedNavigationDestinations = 'https://my-electron-app.com';
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
      event.preventDefault();
    }
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
