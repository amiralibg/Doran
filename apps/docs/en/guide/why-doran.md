# Why Doran

Doran's core is a **zero-dependency**, immutable, tree-shakeable Jalali engine
with **IANA time zones built in**. Against the usual stack — `moment` +
`moment-jalaali` — that translates into a much smaller bundle and faster hot
paths, with no second library for time zones.

## Bundle size

Measured with the same pipeline (esbuild `--minify`, then gzip) so the numbers
are comparable — not pulled from different sources.

| Setup                                        | Minified | Gzipped |
| -------------------------------------------- | -------: | ------: |
| `moment` + `moment-jalaali`                  |  85.5 kB | 25.1 kB |
| `dayjs` + `jalaliday`                        |  16.0 kB |  6.2 kB |
| **`@doranjs/core`** (full barrel)            |  23.5 kB |  7.9 kB |
| `@doranjs/core` — `DoranDate` + `format`     |  19.1 kB |  6.3 kB |
| `@doranjs/core` — conversion primitives only |   4.6 kB |  1.8 kB |
| `@doranjs/core` — `Duration` only            |   5.3 kB |  1.8 kB |

Doran is roughly **3× smaller gzipped than `moment` + `moment-jalaali`** — a real
migration dropped ~63 kB from an app bundle by removing moment. It is in the same
class as `dayjs` + a Jalali plugin, but **zero-dependency**, with **IANA time
zones built in** (no `moment-timezone`), immutable, and Jalali as a first-class
calendar rather than a plugin.

### Tree-shaking

`@doranjs/core` is `"sideEffects": false` and fully ESM, so bundlers drop what
you don't import. Pull only what you use:

```ts
// Just the calendar math — ~1.8 kB gzipped, no formatter, no parser.
import { jalaliToGregorian, gregorianToJalali } from '@doranjs/core';
```

Import named exports (not `import * as`), and let your bundler do the rest.

## Performance

Operations per second, higher is better. `@doranjs/core` vs `moment` +
`moment-jalaali`, Node 20, both pinned to a fixed time zone for a fair
comparison (moment-jalaali is not time-zone-aware by default).

| Operation     | @doranjs/core | moment + moment-jalaali | Speedup |
| ------------- | ------------: | ----------------------: | ------: |
| `format`      |      ~315,000 |                ~289,000 |    1.1× |
| `parse`       |      ~210,000 |                ~128,000 |    1.7× |
| `construct`   |      ~250,000 |                ~127,000 |    2.0× |
| `diff` (days) |   ~38,000,000 |              ~2,200,000 |     17× |

Reproduce locally:

```sh
pnpm --filter @doranjs/core build
node packages/core/bench/index.mjs
```

::: tip Reuse the time zone
Constructing with an explicit `{ timeZone }` (or the system default once) lets
Doran cache the underlying `Intl.DateTimeFormat`. Re-resolving the system zone on
every call is the one thing that measurably slows construction down.
:::

## Beyond the numbers

- **Zero runtime dependencies** — nothing to audit or get a CVE from.
- **Time zones built in** — DST-correct IANA conversion without a second package.
- **Immutable** — every operation returns a new instance; no accidental mutation.
- **One instant, two calendars** — `toISOString()` for your backend,
  `format()` for Jalali display. See [Backends & serialization](/en/guide/backends).
- **TypeScript-native**, with a familiar `dayjs`/`moment` token vocabulary.

CI guards the published bundle with a gzip budget (`scripts/size-check.mjs`), so
these numbers stay honest as the library grows.
