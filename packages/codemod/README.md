# @doranjs/codemod

A [jscodeshift](https://github.com/facebook/jscodeshift) codemod that rewrites **moment / moment-jalaali** to [`@doranjs/core`](https://github.com/amiralibg/Doran/tree/main/packages/core). Anything it can't safely convert is **reported**, never silently changed.

```bash
npx @doranjs/codemod "src/**/*.{ts,tsx}"
npx @doranjs/codemod src --dry --print   # preview without writing
```

Any extra flags pass straight through to `jscodeshift`.

## What it does

| Before                                     | After                                       |
| ------------------------------------------ | ------------------------------------------- |
| `import moment from 'moment-jalaali'`      | `import { DoranDate } from '@doranjs/core'` |
| `moment()`                                 | `DoranDate.now()`                           |
| `moment(x)`                                | `DoranDate.fromGregorian(new Date(x))`      |
| `.format('jYYYY/jMM/jDD')`                 | `.format('YYYY/MM/DD')`                     |
| `.format('YYYY-MM-DD')` (Gregorian)        | `.formatGregorian('YYYY-MM-DD')`            |
| `.utc().format()` / `.format()`            | `.toISOString()`                            |
| `moment.loadPersian()`                     | _(removed)_                                 |
| `.fromNow()` / `.diff()` / `.isBefore()` … | kept 1:1 on the rewritten value             |

## What it flags (manual review)

- `moment(value, format)` — a **calendar parse**, not a 1:1 instant. Use `parseJalali(value, format)` / `parse(...)` from `@doranjs/core`.
- `moment.duration(...)` — use `Duration` / `durationToHuman` from `@doranjs/core`.
- `.format(<dynamic>)` — a non-literal pattern (jalali vs Gregorian tokens differ).

> **Doran is immutable.** `moment` mutates in place; `d.add(...)` returns a new value. Review chained mutations after running the codemod.

See the [migration guide](https://github.com/amiralibg/Doran/blob/main/apps/docs/en/guide/migration.md) for the full parity table and the `eslint-plugin-doran` rule that keeps `moment` from creeping back.
