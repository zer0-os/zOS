import path from 'path';
import fs from 'fs';

const electronPath = fs.realpathSync(process.cwd());
export const resolveElectron = (relativePath) => path.resolve(electronPath, relativePath);

const appPath = path.resolve(electronPath, '..');
export const resolveApp = (relativePath) => path.resolve(appPath, relativePath);

const paths = {
  electronPath,
  electronStatic: resolveElectron('./static'),
  electronMain: resolveElectron('./src/main/main.ts'),
  electronPreloadJs: resolveElectron('./src/preload/preload.ts'),
  electronAppHtml: resolveElectron('./static/app.html'),
  electronSplashHtml: resolveElectron('./static/splash.html'),
  electronSplashJs: resolveElectron('./src/renderer/splash.tsx'),
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appSrc: resolveApp('./src'),
  appIndexJs: resolveApp('./src/index'),
  appPublic: resolveApp('./public'),
};

export default paths;
