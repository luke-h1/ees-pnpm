/* eslint-disable no-param-reassign */
const flowRight = require('lodash/fp/flowRight');
const withTranspileModules = require('next-transpile-modules');
const path = require('path');

const nextConfig = {
  env: {
    BUILD_NUMBER: process.env.BUILD_BUILDNUMBER,
  },
  publicRuntimeConfig: {
    APP_ENV: process.env.APP_ENV,
    CONTENT_API_BASE_URL: process.env.CONTENT_API_BASE_URL,
    DATA_API_BASE_URL: process.env.DATA_API_BASE_URL,
    NOTIFICATION_API_BASE_URL: process.env.NOTIFICATION_API_BASE_URL,
    APPINSIGHTS_INSTRUMENTATIONKEY: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    PUBLIC_URL: process.env.PUBLIC_URL,
  },
  async redirects() {
    return [
      {
        source: '/download-latest-data',
        destination: '/data-catalogue',
        permanent: true,
      },
      {
        source: '/find-statistics/:publication/meta-guidance',
        destination: '/find-statistics/:publication/data-guidance',
        permanent: true,
      },
      {
        source: '/find-statistics/:publication/:release/meta-guidance',
        destination: '/find-statistics/:publication/:release/data-guidance',
        permanent: true,
      },
    ];
  },
  webpack(config, options) {
    const { dev, isServer } = options;

    if (isServer) {
      const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');

      config.plugins.push(
        new ForkTsCheckerPlugin({
          typescript: {
            configFile: path.resolve(__dirname, 'src/tsconfig.json'),
          },
        }),
      );

      config.externals = [...config.externals, 'react', 'react-dom'];
    }

    if (dev) {
      const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

      config.plugins.push(new CaseSensitivePathsPlugin());

      if (process.env.STYLELINT_DISABLE !== 'true') {
        const StylelintPlugin = require('stylelint-webpack-plugin');

        config.plugins.push(
          new StylelintPlugin({
            // Next doesn't play nicely with emitted errors
            // so we'll just display warnings instead
            emitErrors: false,
          }),
        );
      }

      if (dev && process.env.ESLINT_DISABLE !== 'true') {
        const ESLintPlugin = require('eslint-webpack-plugin');

        config.plugins.push(
          new ESLintPlugin({
            extensions: ['js', 'jsx', 'ts', 'tsx'],
          }),
        );
      }
    }

    // symlinks
    config.resolve.symlinks = true;

    config.resolve.alias = {
      ...config.resolve.alias,
      './dist/cpexcel.js': false,
      react: path.resolve(__dirname, 'node_modules/react'),
      formik: path.resolve(__dirname, 'node_modules/formik'),
    };

    return config;
  },
};

// Plugins are applied to the
// Next config from left to right
module.exports = flowRight(
  withTranspileModules(['explore-education-statistics-common'], {
    resolveSymlinks: true,
  }),
)(nextConfig);
