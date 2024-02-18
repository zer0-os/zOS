import * as Sentry from '@sentry/react';
import { config } from './config';

interface ElectronWindow extends Window {
  electron: {
    enabled: boolean;
    getPreloadPath: () => string;
  };
}

declare let window: ElectronWindow;

export const isElectron = (): boolean => typeof window !== 'undefined' && window?.electron?.enabled;

export const showReleaseVersionInConsole = (): void => {
  console.log('Release version:', config.appVersion);
};

export const initializeErrorBoundary = () => {
  Sentry.init({
    ...config.sentry,
  });
};
