// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron');


const isValidChannel = (channel) => [
  'zchain-ipc-transport-main',
  'zchain-ipc-transport-renderer',
  'startZChainServer',
  'ZChainServerStarted',
].includes(channel);

const ipc = {
  send: (channel, data) => {
    if (!isValidChannel(channel)) return console.log(`ipc.send - invalid channel: [${channel}]`);

    ipcRenderer.send(channel, data);
  },
  on: (channel, func) => {
    if (!isValidChannel(channel)) return console.log(`ipc.on - invalid channel: [${channel}]`);

    ipcRenderer.on(channel, (_event, ...args) => func(...args));
  },
  once: (channel, func) => {
    if (!isValidChannel(channel)) return console.log(`ipc.once - invalid channel: [${channel}]`);

    ipcRenderer.once(channel, (_event, ...args) => func(...args));
  },
};

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('versions', process.versions);
  contextBridge.exposeInMainWorld('isElectron', true);
  contextBridge.exposeInMainWorld('ipc', ipc);
});
