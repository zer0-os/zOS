// const Server = require('ssb-server')
// const Config = require('ssb-config/inject')

const remote = require('@electron/remote');

const { ipcRenderer } = require('electron');
const localLog = console.log;
const localError = console.error;

const remoteLog = remote.getGlobal('console').log;
const remoteError = remote.getGlobal('console').error;
// const electronIpcPlugin = require('multiserver-electron-ipc');
// const NoauthTransformPlugin = require('multiserver/plugins/noauth');

// Set up logging from electron to the console
console.log = (...args) => {
  localLog.apply(console, args);
  remoteLog('From server window: ', ...args);
}

console.error = (...args) => {
  localError.apply(console, args);
  remoteError('From server window: ', ...args);
}

process.exit = remote.app.quit;
// redirect errors to stderr
window.addEventListener('error', (e) => {
  e.preventDefault();
  console.error(e.error.stack || 'Uncaught ' + e.error);
});

// Setup the SSB Server
function init(ipcMain, _webContentsPromise) {
  ipcMain.on('zchain-ipc-transport-main', (_,data) => {
    console.log('got message: ', data);
  });
}

init(ipcRenderer, Promise.resolve(ipcRenderer));
