# eslint-plugin-doran

ESLint rules for migrating to [Doran](https://github.com/amiralibg/Doran). Currently ships `no-moment`, which flags `moment` / `moment-jalaali` usage so it doesn't creep back after you migrate with [`@doranjs/codemod`](https://github.com/amiralibg/Doran/tree/main/packages/codemod).

```bash
pnpm add -D eslint-plugin-doran
```

## Usage (flat config, ESLint 9+)

```js
// eslint.config.js
import doran from 'eslint-plugin-doran';

export default [doran.configs.recommended];
```

Or wire the rule manually:

```js
import doran from 'eslint-plugin-doran';

export default [
  {
    plugins: { doran },
    rules: { 'doran/no-moment': 'error' },
  },
];
```

## Rules

### `no-moment`

Flags:

- `import … from 'moment'` / `'moment-jalaali'` and the `require(...)` equivalents.
- `moment(...)` / `momentj(...)` call sites.

Each report points at the Doran equivalent and suggests running `npx @doranjs/codemod` to do the rewrite. The codemod is the safe automated path; this rule is the guardrail.
