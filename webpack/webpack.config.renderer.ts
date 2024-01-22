import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import 'webpack-dev-server';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import TerserPlugin from 'terser-webpack-plugin';

export const rendererConfig: webpack.Configuration = {
  mode: 'development',
  entry: './src/index.tsx',
  resolve: {
    alias: {
      'remark-emoji': path.resolve('./node_modules/remark-emoji'),
      './lib/platform': path.resolve('./src/lib/platform/index.desktop.ts'),
    },
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
        include: path.resolve(__dirname, '..', 'src'),
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      // Test for esbuild and swc loaders
      //   {
      //     test: /\.(ts|tsx)$/,
      //     include: path.resolve(__dirname, 'src'),
      //     exclude: /node_modules/,
      //     loader: 'esbuild-loader',
      //     options: {
      //       target: 'es2015',
      //     },
      //   },
      //   {
      //     test: /\.(ts|tsx)$/,
      //     include: path.resolve(__dirname, 'src'),
      //     exclude: /node_modules/,
      //     loader: "swc-loader"
      //   },
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
    new DotEnv(),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve('./public/olm.js'), to: 'olm.js' },
        { from: path.resolve('./public/olm.wasm'), to: 'olm.wasm' },
        { from: path.resolve('./public/logo512.png'), to: 'logo512.png' },
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
      directory: path.join(__dirname, 'public'),
    },
  },
};
