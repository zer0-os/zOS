import * as Sentry from '@sentry/react';
import { isDesktopApp } from '@todesktop/client-core/platform/todesktop';
import { config } from './config';
import { MainBackground } from './store/background';

export const isElectron = (): boolean => isDesktopApp();

export const showReleaseVersionInConsole = (): void => {
  console.log('Release version:', config.appVersion);
};

export const initializeErrorBoundary = () => {
  Sentry.init({
    ...config.sentry,
  });
};

export function getMainBackgroundClass(selectedMainBackground) {
  switch (selectedMainBackground) {
    case MainBackground.AnimatedGreenParticles:
    case MainBackground.AnimatedBlackParticles:
      return 'animated';
    case MainBackground.StaticGreenParticles:
    default:
      return 'static-green-particles';
  }
}

export function getMainBackgroundVideoSrc(selectedMainBackground) {
  switch (selectedMainBackground) {
    case MainBackground.AnimatedGreenParticles:
      return `${config.videoAssetsPath}GreenParticlesBG.mp4`;
    case MainBackground.AnimatedBlackParticles:
      return `${config.videoAssetsPath}BlackParticlesBG.mp4`;
    default:
      return '';
  }
}
