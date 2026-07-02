# Migration Guide

Moving to Doran from another Persian-date library is usually a small, mechanical change.

## Full parity matrix — moment / dayjs vs Doran

| Operation                | `moment-jalaali`                      | `dayjs` (Jalali plugin)               | Doran (`@doranjs/core`)                      |
| ------------------------ | ------------------------------------- | ------------------------------------- | -------------------------------------------- |
| **Create now**           | `moment()`                            | `dayjs()`                             | `DoranDate.now()`                            |
| **From `Date`**          | `moment(date)`                        | `dayjs(date)`                         | `DoranDate.fromGregorian(date)`              |
| **From epoch ms**        | `moment(ms)`                          | `dayjs(ms)`                           | `DoranDate.fromEpochMs(ms)`                  |
| **Fields**               | `m.jYear()` / `jMonth()` / `jDate()`  | `.jYear()` / `.jMonth()` / `.jDate()` | `d.year` / `d.month` / `d.day`               |
| **Time fields**          | `.hour()` / `.minute()` / `.second()` | `.hour()` / `.minute()` / `.second()` | `d.hour` / `d.minute` / `d.second`           |
| **Add**                  | `m.add(1, 'jMonth')`                  | `.add(1, 'jMonth')`                   | `d.addMonths(1)` or `d.add(1, 'month')`      |
| **Subtract**             | `m.subtract(1, 'day')`                | `.subtract(1, 'day')`                 | `d.addDays(-1)` or `d.subtract(1, 'day')`    |
| **Format**               | `m.format('jYYYY/jMM/jDD')`           | `.format('jYYYY/jMM/jDD')`            | `d.format('YYYY/MM/DD')`                     |
| **Gregorian format**     | `m.format('YYYY-MM-DD')`              | `.format('YYYY-MM-DD')`               | `d.formatGregorian('YYYY-MM-DD')`            |
| **Start of**             | `m.startOf('jMonth')`                 | `.startOf('month')`                   | `d.startOf('month')`                         |
| **End of**               | `m.endOf('jYear')`                    | `.endOf('year')`                      | `d.endOf('year')`                            |
| **Diff**                 | `a.diff(b, 'jMonth')`                 | `.diff(b, 'month')`                   | `a.diff(b, 'month')`                         |
| **Is before / after**    | `m.isBefore(other)`                   | `.isBefore(other)`                    | `d.isBefore(other)`                          |
| **Is between**           | `m.isBetween(a, b)`                   | `.isBetween(a, b)`                    | `d.isBetween(a, b, '[]')`                    |
| **From now**             | `m.fromNow()`                         | `.fromNow()`                          | `d.fromNow()`                                |
| **To native Date**       | `m.toDate()`                          | `.toDate()`                           | `d.toGregorian()`                            |
| **To ISO string**        | `m.toISOString()`                     | `.toISOString()`                      | `d.toISOString()` ✅ Gregorian UTC           |
| **To Jalali ISO**        | —                                     | —                                     | `d.toJalaliISO()`                            |
| **Epoch ms**             | `m.valueOf()`                         | `.valueOf()`                          | `d.valueOf()` / `d.toMillis()` / `d.epochMs` |
| **Epoch seconds**        | `m.unix()`                            | `.unix()`                             | `d.unix()`                                   |
| **Duration humanize**    | `moment.duration(s, 's').humanize()`  | —                                     | `durationToHuman(s)`                         |
| **Immutable**            | ❌ mutable                            | ✅                                    | ✅                                           |
| **Zero dependencies**    | ❌                                    | ✅                                    | ✅                                           |
| **TypeScript-first**     | ❌                                    | partial                               | ✅                                           |
| **Week starts Saturday** | ✅                                    | plugin                                | ✅ built-in                                  |

> **Months are 1-based in Doran.** `d.month === 1` is Farvardin.
> In `moment-jalaali`, `jMonth()` is 0-based — add 1 when migrating.

## Automated migration

Most of the table above can run automatically.

### Codemod — `@doranjs/codemod`

A jscodeshift codemod that rewrites `moment` / `moment-jalaali` to `@doranjs/core`. Anything it can't safely convert is **reported**, never silently changed:

```bash
npx @doranjs/codemod "src/**/*.{ts,tsx}"
npx @doranjs/codemod src --dry --print   # preview without writing
```

Handles: the import, `moment()` → `DoranDate.now()`, `moment(x)` → `DoranDate.fromGregorian(new Date(x))`, `.format('jYYYY/jMM/jDD')` → `.format('YYYY/MM/DD')`, Gregorian patterns → `.formatGregorian(...)`, `.utc().format()` → `.toISOString()`, and drops `moment.loadPersian()`. The 1:1 methods (`fromNow` / `diff` / `isBefore` / …) keep working on the rewritten value. A calendar parse (`moment(value, format)`) is flagged for manual review.

### ESLint rule — `eslint-plugin-doran`

Keep `moment` from creeping back after the migration:

```js
// eslint.config.js
import doran from 'eslint-plugin-doran';

export default [doran.configs.recommended];
// or manually: { plugins: { doran }, rules: { 'doran/no-moment': 'error' } }
```

The `no-moment` rule flags every `moment`/`moment-jalaali` import and `moment(...)` / `momentj(...)` call with a suggested Doran equivalent.

## From `moment-jalaali`

```ts
// Before
import moment from 'moment-jalaali';
const m = moment();
m.jYear();
m.jMonth() + 1;
m.jDate();
m.add(1, 'jMonth');
m.format('jYYYY/jMM/jDD');
m.toDate();
m.toISOString(); // Gregorian ✅
moment.duration(seconds, 's').humanize(); // "3 hours"

// After
import { DoranDate, durationToHuman } from '@doranjs/core';
const d = DoranDate.now();
d.year;
d.month;
d.day;
d.addMonths(1);
d.format('YYYY/MM/DD');
d.toGregorian();
d.toISOString(); // Gregorian UTC ✅
durationToHuman(seconds); // "۳ ساعت" (or pass enUS for English)
```

Key differences:

- Doran is **immutable** — `d.addMonths(1)` returns a new value; it never mutates `d`.
- No `j` prefix in format tokens — they always apply to the Jalali calendar.
- Months are **1-based** (`1` = Farvardin), unlike Moment's 0-based `jMonth()`.

## From `jalaali-js`

`jalaali-js` exposes raw conversion functions. Doran offers the same primitives plus a
rich `DoranDate`:

| `jalaali-js`                 | Doran                           |
| ---------------------------- | ------------------------------- |
| `jalaali.toJalaali(g)`       | `gregorianToJalali(y, m, d)`    |
| `jalaali.toGregorian(j)`     | `jalaliToGregorian(jy, jm, jd)` |
| `jalaali.isLeapJalaaliYear`  | `isLeapJalaliYear`              |
| `jalaali.jalaaliMonthLength` | `jalaliMonthLength`             |

The numeric results are identical — Doran uses the same underlying algorithm.

## From `dayjs` (with a Jalali plugin)

`DoranDate.format` uses a familiar `dayjs`-style token vocabulary (`YYYY`, `MM`, `dddd`,
`HH`, `A`, …), so most format strings carry over directly. See the
[`@doranjs/core` API](/en/api/core) for the full token table.

## RTL / digit gotchas

### Persian vs Latin digits

By default `faIR` emits Persian digits. Switch globally with:

```ts
import { setDefaultLocale, enUS } from '@doranjs/core';
setDefaultLocale(enUS); // Latin digits everywhere, including pickers
```

Or per-instance: `d.withLocale(enUS).format('YYYY/MM/DD')`.

### Gregorian strings inside RTL containers

When you render a Gregorian ISO string (e.g. `"2026-05-17 10:28"`) inside a
`dir="rtl"` container, the browser flips it visually to `"10:28 2026-05-17"`.
Fix with an explicit `dir="ltr"` on the element:

```tsx
<span dir="ltr">{date.formatGregorian('YYYY-MM-DD HH:mm')}</span>
// or
<span dir="ltr">{date.toISOString()}</span>
```

`date.format('YYYY/MM/DD')` (Jalali) does not need this — Persian strings are RTL-neutral.
