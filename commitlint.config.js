/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'core',
        'nlp',
        'holidays',
        'react',
        'vue',
        'svelte',
        'angular',
        'ui',
        'zod',
        'docs',
        'playground',
        'repo',
        'deps',
        'ci',
      ],
    ],
  },
};
