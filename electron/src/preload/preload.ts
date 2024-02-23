import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  enabled: true,
});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

console.log('preload');
