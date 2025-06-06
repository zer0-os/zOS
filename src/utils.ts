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

export const setSentryUser = (userId: string) => {
  if (userId) {
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null);
  }
};

export function getMainBackgroundClass(selectedMainBackground) {
  switch (selectedMainBackground) {
    case MainBackground.AnimatedGreenParticles:
    case MainBackground.AnimatedBlackParticles:
      return 'animated';
    case MainBackground.StaticGreenParticles:
      return 'static-green-particles';
    case MainBackground.DotGrid:
      return 'dot-grid';
    case MainBackground.StaticLightsOut:
    default:
      return 'static-lights-out';
  }
}

export function getMainBackgroundVideoSrc(selectedMainBackground) {
  switch (selectedMainBackground) {
    case MainBackground.AnimatedGreenParticles:
      return `${config.videoAssetsPath}/GreenParticlesBG.mp4`;
    case MainBackground.AnimatedBlackParticles:
      return `${config.videoAssetsPath}/BlackParticlesBG.mp4`;
    default:
      return '';
  }
}

export const isMobile = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};
