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
};
