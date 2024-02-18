import { app, ipcMain } from 'electron';
import log from 'electron-log/main';

import { getOrCreateMainWindow, createSplashScreen, mainIsReady } from './windows';
import { setupUpdates } from './update';

declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
async function onReady() {
  log.initialize();
  log.info('onReady');
  createSplashScreen();
  setupUpdates();
  setupIpc();
  mainIsReady();
  await getOrCreateMainWindow();
}

function setupIpc() {
  ipcMain.on('get-preload-path', (e) => {
    e.returnValue = APP_WINDOW_PRELOAD_WEBPACK_ENTRY;
  });
}

function onBeforeQuit() {
  log.info('onBeforeQuit');
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
function onWindowsAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

export function main() {
  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require('electron-squirrel-startup')) {
    app.quit();
  }

  app.name = 'zOS Desktop';

  app.whenReady().then(onReady);
  app.on('before-quit', onBeforeQuit);
  app.on('window-all-closed', onWindowsAllClosed);
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    app.whenReady().then(getOrCreateMainWindow);
  });
}

main();
