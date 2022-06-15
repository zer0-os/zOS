const path = require('path');

module.exports = {
  webpack: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-router-dom': path.resolve('./node_modules/react-router-dom'),
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
