'use strict';

const { merge } = require('webpack-merge');

const config = require('./webpack.config.js');
const PATHS = require('./paths.js');

// Merge webpack configuration files
const webpackConfig = merge(config, {
  output: {
    // the build folder to output bundles and assets in.
    path: PATHS.build,
    // the filename template for entry chunks
    filename: '[name].js',
  },
});

module.exports = webpackConfig;
