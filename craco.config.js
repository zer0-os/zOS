const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {},
    configure: {
      resolve: {
        // https://webpack.js.org/configuration/resolve/#resolvefallback
        // https://web3auth.io/docs/troubleshooting/webpack-issues#react-create-react-app
        // https://docs.cloud.coinbase.com/wallet-sdk/docs/web3-react
        fallback: {
          crypto: false,
          fs: false,
          buffer: require.resolve('buffer'),
          stream: require.resolve('stream-browserify'),
          util: require.resolve('util/'),
          assert: require.resolve('assert/'),
        },
      },
      // https://github.com/facebook/create-react-app/discussions/11767
      ignoreWarnings: [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          );
        },
      ],
      module: {
        rules: [
          {
            test: /\.mjs/,
            include: /node_modules/,
            type: 'javascript/auto',
          },
        ],
      },
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
  devServer: {},
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
