import * as Sentry from '@sentry/react';
import { isDesktopApp } from '@todesktop/client-core/platform/todesktop';
import { config } from './config';

interface ElectronWindow extends Window {
  isElectron: boolean;
}

declare let window: ElectronWindow;

export const isElectron = (): boolean => isDesktopApp();

export const showReleaseVersionInConsole = (): void => {
  console.log('Release version:', config.appVersion);
};

export const initializeErrorBoundary = () => {
  Sentry.init({
    ...config.sentry,
  });
};
