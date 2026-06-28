'use strict';

const noMoment = require('./rules/no-moment');

const { name, version } = require('../package.json');

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: { name, version },
  rules: { 'no-moment': noMoment },
};

// Flat-config preset: `extends: [doran.configs.recommended]` (ESLint 9+).
plugin.configs = {
  recommended: {
    plugins: { doran: plugin },
    rules: { 'doran/no-moment': 'error' },
  },
};

module.exports = plugin;
