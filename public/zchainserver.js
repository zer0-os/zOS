// const Server = require('ssb-server')
// const Config = require('ssb-config/inject')

const os = require('os');
const path = require('path');

const remote = require('@electron/remote');
const { MEOW } = require('meow-app'); 

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

function getFullPath(fileName) {
  return path.join(os.homedir(), 'ids', fileName); 
}

let app = null;

// Setup the SSB Server
function init(ipcMain, _webContentsPromise) {
  console.log('initializing ', MEOW);

  app = new MEOW();

  ipcMain.on('zchain-ipc-transport-main', async (_,data) => {
    const { method, payload } = JSON.parse(data);

    console.log(`calling [${method}] with: `, payload);

    // const fileName = `${payload}.json`;

    if (method === 'init') {
      // await app[method](getFullPath(fileName));
      await app.init();

      console.log(app.listFollowedPeers());
    }
  });
}

init(ipcRenderer, Promise.resolve(ipcRenderer));
