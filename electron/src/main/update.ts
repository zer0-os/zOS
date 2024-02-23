import log from 'electron-log/main';
import { updateElectronApp, UpdateSourceType } from 'update-electron-app';

export function setupUpdates() {
  setTimeout(() => {
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
