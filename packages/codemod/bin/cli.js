#!/usr/bin/env node
'use strict';

// Thin wrapper: runs the bundled transform through jscodeshift with sensible
// defaults (TSX parser, common extensions). Extra flags pass straight through.
const path = require('node:path');
const { spawn } = require('node:child_process');

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(
    'Usage: doran-codemod <path…> [jscodeshift flags]\n\n' +
      'Rewrites moment / moment-jalaali to @doranjs/core.\n' +
      'Anything it cannot auto-convert is reported (not silently changed).\n\n' +
      'Example: doran-codemod "src/**/*.{ts,tsx}"\n' +
      '         doran-codemod src --dry --print   # preview without writing',
  );
  process.exit(args.length === 0 ? 1 : 0);
}

const jscodeshift = require.resolve('jscodeshift/bin/jscodeshift.js');
const transform = path.join(__dirname, '..', 'transforms', 'moment-to-doran.js');

const child = spawn(
  process.execPath,
  [jscodeshift, '-t', transform, '--parser', 'tsx', '--extensions', 'ts,tsx,js,jsx', ...args],
  { stdio: 'inherit' },
);
child.on('exit', (code) => process.exit(code ?? 0));
