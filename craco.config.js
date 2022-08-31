const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());

/**
 * Converts a relative path to an absolute path.
 * e.g. '../zApp-Staking' -> '/users/zero/zApp-Staking'
 */
const resolveApp = (relativePath) => {
  path.resolve(appDirectory, relativePath);
};

/**
 * Maps a list of relative app locations to absolute paths
 */
const resolveApps = (appLocations) => {
  return appLocations.map((app) => resolveApp(app));
};

module.exports = {
  webpack: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-router': path.resolve('./node_modules/react-router'),
      'react-router-dom': path.resolve('./node_modules/react-router-dom'),
    },
  },
  plugins: [
    {
      /* Runs babel-loader on arbitrary folders, enabling us to use ES6
       * syntax in linked zApps */
      plugin: require('craco-babel-loader'),
      options: {
        // Relative locations of linked packages e.g. '../zApp-BuyDomains', '../zApp-Staking'
        // Note: do not commit any changes to this array
        includes: resolveApps([]),
      },
    },
  ],
  devServer: {
    watchOptions: {
      ignored: '**/node_modules/**',
    },
  },
  jest: {
    configure: (jestConfig) => {
      return {
        ...jestConfig,
        transformIgnorePatterns: [
          '/node_modules/@cloudinary/url-gen/\\.(js|ts|tsx)$',
        ],
      };
    },
  },
};
