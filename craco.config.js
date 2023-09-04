const path = require('path');

module.exports = {
  webpack: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-router': path.resolve('./node_modules/react-router'),
      'react-router-dom': path.resolve('./node_modules/react-router-dom'),
      '@zer0-os/zos-component-library': path.resolve('./node_modules/@zer0-os/zos-component-library'),
    },
    configure: (webpackConfig, { _env, _paths }) => {
      const EXCLUDED_PLUGINS = ['ForkTsCheckerWebpackPlugin'];
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => !EXCLUDED_PLUGINS.includes(plugin.constructor.name)
      );
      return webpackConfig;
    },
  },
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
  typescript: {
    enableTypeChecking: false /* (default value) */,
  },
  eslint: {
    enable: false /* (default value) */,
  },
};
