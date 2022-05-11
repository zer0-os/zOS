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
function init(_ipcMain, _webContentsPromise) {
  console.log('initializing server');
  // const config = Config(process.env.SSB_APP_NAME, {
  //   connections: {
  //     incoming: {
  //       channel: [{scope: 'device', transform: 'noauth'}],
  //       ws: [{
  //         scope: ["local", "device"],
  //         port: 8990,
  //         transform: "shs",
  //       }]
  //     },
  //     outgoing: {
  //       net: [{transform: 'shs'}],
  //     },
  //   },
  // });

  // function electronIpcTransport(ssb) {
  //   ssb.multiserver.transport({
  //     name: 'channel',
  //     create: () => electronIpcPlugin({ipcMain, webContentsPromise}),
  //   });
  // }

  // function noAuthTransform(ssb, cfg) {
  //   ssb.multiserver.transform({
  //     name: 'noauth',
  //     create: () =>
  //       NoauthTransformPlugin({
  //         keys: {publicKey: Buffer.from(cfg.keys.public, 'base64')},
  //       }),
  //   });
  // }

  // Server
  //   .use(noAuthTransform)
  //   .use(electronIpcTransport)
  //   .use(require('ssb-master'))
  //   .use(require('ssb-query'))
  //   .use(require('ssb-conn'))
  //   .use(require('ssb-replicate'))
  //   .use(require('ssb-friends'))
  //   .use(require('ssb-blobs'))
  //   .use(require('ssb-ws'))
  //   .use(require('ssb-invite')) // look into peer invites. i think it might be what we will want to use internally, at least. https://github.com/ssbc/ssb-peer-invites
  //   .use(require('ssb-backlinks'));

  // const server = Server(config);

  // server.whoami((_err, feed) => console.log(`SSB server started with ID: [${feed.id}]`));
  // // const manifest = server.getManifest();
  // // console.log('the manifest', manifest);

  // return server;
}

init(ipcRenderer, Promise.resolve(ipcRenderer));
