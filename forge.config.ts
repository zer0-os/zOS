import path from 'path';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack/webpack.config.main';
import { rendererConfig } from './webpack/webpack.config.renderer';
import { preloadConfig } from './webpack/webpack.config.preload';

const config: ForgeConfig = {
  rebuildConfig: {},
  plugins: [
    // new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      port: 4000,
      jsonStats: true,
      devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            name: 'main_window',
            html: './electron/renderer.html',
            js: './src/index.tsx',
            preload: {
              js: './electron/preload.ts',
              config: preloadConfig,
            },
          },
          {
            name: 'splash',
            html: './electron/splash.html',
            js: './electron/splash.tsx',
          },
        ],
      },
    }),
  ],
  packagerConfig: {
    name: 'zOS',
    executableName: 'zOS',
    asar: true,
    icon: path.resolve(__dirname, 'electron', 'assets', 'icons', 'zero-white-icon'),
    appBundleId: 'com.zero.zOS',
    usageDescription: {
      Camera: 'Access is needed by certain built-in fiddles in addition to any custom fiddles that use the Camera',
      Microphone:
        'Access is needed by certain built-in fiddles in addition to any custom fiddles that use the Microphone',
      Calendars:
        'Access is needed by certain built-in fiddles in addition to any custom fiddles that may access Calendars',
      Contacts:
        'Access is needed by certain built-in fiddles in addition to any custom fiddles that may access Contacts',
      Reminders:
        'Access is needed by certain built-in fiddles in addition to any custom fiddles that may access Reminders',
    },
    appCategoryType: 'public.app-category.social-networking',
    protocols: [
      {
        name: 'zOS Launch Protocol',
        schemes: ['zos'],
      },
    ],
    win32metadata: {
      CompanyName: 'Zero',
      OriginalFilename: 'zOS',
    },
    osxSign: {
      identity: 'Developer ID Application: Scott St. Technology Company, Inc. (R69LH6W94B)',
    },
  },
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'thewarman',
          name: 'zOS',
        },
        draft: true,
        prerelease: true,
      },
    },
  ],
};

function notarizeMaybe() {
  if (process.platform !== 'darwin') {
    return;
  }

  if (!process.env.CI && !process.env.FORCE_NOTARIZATION) {
    // Not in CI, skipping notarization
    console.log('Not in CI, skipping notarization');
    return;
  }

  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.warn('Should be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!');
    return;
  }

  config.packagerConfig!.osxNotarize = {
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: 'R69LH6W94B',
  };
}

notarizeMaybe();

export default config;
