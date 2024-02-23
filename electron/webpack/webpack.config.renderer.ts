import path from 'path';
import webpack from 'webpack';
import 'webpack-dev-server';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import TerserPlugin from 'terser-webpack-plugin';

import paths from './paths';

export const rendererConfig: webpack.Configuration = {
  mode: 'development',
  entry: paths.appIndexJs,
  resolve: {
    alias: {},
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
    ],
    fallback: {
      buffer: require.resolve('buffer'),
      crypto: false,
    },
    plugins: [],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: paths.appSrc,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.(css|scss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: require.resolve('@svgr/webpack'),
            options: {
              prettier: false,
              svgo: false,
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
              titleProp: true,
              ref: true,
              exportType: 'named',
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new DotEnv({
      path: paths.dotenv,
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(paths.appPublic, 'olm.js'), to: 'olm.js' },
        { from: path.join(paths.appPublic, 'olm.wasm'), to: 'olm.wasm' },
        { from: path.join(paths.appPublic, 'logo512.png'), to: 'logo512.png' },
      ],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        // `terserOptions` options will be passed to `swc` (`@swc/core`)
        // Link to options - https://swc.rs/docs/config-js-minify
        terserOptions: {},
      }),
    ],
    splitChunks: {
      chunks: 'all',
    },
  },
  devServer: {
    static: {
      directory: paths.appPublic,
    },
  },
  devtool: 'source-map',
};
