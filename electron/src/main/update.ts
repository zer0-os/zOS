import log from 'electron-log/main';

export function setupUpdates() {
  setTimeout(() => {
    const { updateElectronApp, UpdateSourceType } = require('update-electron-app');
    updateElectronApp({
      updateSource: {
        type: UpdateSourceType.ElectronPublicUpdateService,
        host: 'https://update.electronjs.org',
        repo: 'zer0-os/zOS',
      },
      updateInterval: '1 hour',
      logger: log,
    });
  }, 10000);
}
