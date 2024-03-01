const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-router': path.resolve('./node_modules/react-router'),
      'react-router-dom': path.resolve('./node_modules/react-router-dom'),
      '@zer0-os/zos-component-library': path.resolve('./node_modules/@zer0-os/zos-component-library'),
    },
    configure: (webpackConfig) => {
      // Remove the ModuleScopePlugin which throws when we try to import something outside the `src` directory
      // It's meant to protect you from doing weird things but since we use `alias` to
      // force zui to use the version of react in the node_modules, we need to disable it.
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );
      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);

      // Append our custom webpack config
      webpackConfig.resolve = { ...webpackConfig.resolve, ...webpackCustomConfig.resolve };
      webpackConfig.ignoreWarnings = webpackCustomConfig.ignoreWarnings;
      webpackConfig.watchOptions = webpackCustomConfig.watchOptions;
      webpackConfig.module.rules = [...webpackConfig.module.rules, ...webpackCustomConfig.module.rules];
      return webpackConfig;
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

const webpackCustomConfig = {
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
  watchOptions: {
    ignored: '**/node_modules/**',
  },
};
