# @doranjs/core

## 0.1.3

### Patch Changes

- [#50](https://github.com/amiralibg/Doran/pull/50) [`6335e77`](https://github.com/amiralibg/Doran/commit/6335e7728f1f5603e3a78b3d94d1821992e223e7) Thanks [@amiralibg](https://github.com/amiralibg)! - Replace raw NUL bytes (U+0000) in the parse compile-cache key with `\u0000` escape sequences. The literal control characters shipped verbatim in the published dist and broke consumers whose bundler executes modules via `eval(TrustedScript)` — Firefox truncates the script at the first NUL, throwing `SyntaxError: ` literal not terminated before end of script`` (seen with Next.js dev mode on Firefox 133+). The cache key value is unchanged; the source and dist are now clean ASCII.

## 0.1.2

### Patch Changes

- [#48](https://github.com/amiralibg/Doran/pull/48) [`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d) Thanks [@amiralibg](https://github.com/amiralibg)! - Make `toLatinDigits` actually convert digits instead of returning its input unchanged.

  `toLatinDigits` was an identity function, serving as the `formatNumber` hook for the
  Latin-digit locale where identity is correct. But its public name promises a
  Persian/Arabic → Latin conversion, so consumers normalizing user input reached for it
  and got a silent no-op — Persian-keyboard input failed `/[0-9]/` validation with no
  error to trace.

  It now delegates to `normalizeDigits`, handling both the Persian ۰-۹ and Arabic-Indic
  ٠-٩ families. This is not a breaking change: `normalizeDigits` is identity for ASCII
  input, and every `formatNumber` call site passes ASCII, so Latin-locale formatting is
  byte-for-byte unchanged.

## 0.1.1

### Patch Changes

- [#44](https://github.com/amiralibg/Doran/pull/44) [`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302) Thanks [@amiralibg](https://github.com/amiralibg)! - Localize calendar footer actions such as Today and Clear from the active locale instead of always showing Persian labels.

## 0.1.0

### Minor Changes

- [#17](https://github.com/amiralibg/Doran/pull/17) [`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6) Thanks [@amiralibg](https://github.com/amiralibg)! - **`@doranjs/core`**
  - `durationToHuman(seconds, locale?)` — standalone duration humanizer replacing `moment.duration(s, 'seconds').humanize()`. Uses the global default locale when none is given.

  **`@doranjs/react`**
  - `DoranRangePicker` / `useDateRange`: `onChange` now receives a second argument `gregorian: GregorianDateRange` (`{ start: Date | null; end: Date | null }`) so you can post Gregorian ISO strings to your backend without extra conversion.
  - `DoranRangePicker`: `locale` prop now falls back to `getDefaultLocale()` (consistent with `DoranDatePicker`).
  - New exported type: `GregorianDateRange`.

- [#17](https://github.com/amiralibg/Doran/pull/17) [`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6) Thanks [@amiralibg](https://github.com/amiralibg)! - **Breaking fix:** `toISOString()` and `toJSON()` now return a standard Gregorian UTC ISO-8601 string (e.g. `"2026-05-31T10:09:05.000Z"`), matching `Date`, `dayjs`, and `moment` — making `JSON.stringify({ d: DoranDate.now() })` safe to send to any backend without extra conversion.

  **Migration:** if you relied on the previous Jalali ISO output, replace `.toISOString()` with `.toJalaliISO()`.

  New methods added:
  - `toJalaliISO()` — the former `toISOString()` behaviour (Jalali calendar, local offset)
  - `toGregorianISO()` — explicit alias for the new `toISOString()`
  - `toGregorianParts()` — Gregorian wall-clock fields in the instance's time zone
  - `formatGregorian(pattern)` — format with Gregorian fields using the same token vocabulary
  - `unix()` — epoch seconds (moment/dayjs parity)
  - `toMillis()` — epoch milliseconds as a method (dayjs parity)

## 0.0.4

### Patch Changes

- [#12](https://github.com/amiralibg/Doran/pull/12) [`61081b7`](https://github.com/amiralibg/Doran/commit/61081b70894f1b15830e87cd28ab8958803ca080) Thanks [@amiralibg](https://github.com/amiralibg)! - Migrate the build toolchain from `tsup` (no longer maintained) to
  [`tsdown`](https://tsdown.dev) (rolldown-based). The published output is
  equivalent: same `.js`/`.cjs` + `.d.ts`/`.d.cts` entry points and sourcemaps, the
  React and Web Component stylesheets ship unchanged, and `@doranjs/wc` still emits its
  self-registering `dist/doran.global.js` IIFE bundle for CDN use. No API or runtime
  behavior changes.

## 0.0.3

### Patch Changes

- [#6](https://github.com/amiralibg/Doran/pull/6) [`5ae247a`](https://github.com/amiralibg/Doran/commit/5ae247a58476585a2a9aa8062780ad8aac3d3805) Thanks [@amiralibg](https://github.com/amiralibg)! - Working-day arithmetic, natural-language ranges/durations/recurrence, and range-picker
  presets + multi-month views.
  - `@doranjs/core` — a pure, weekend-aware working-day engine: `isWeekend`, `isWorkingDay`,
    `addWorkingDays`, `nextWorkingDay`, `previousWorkingDay`, and `workingDaysBetween`.
    Each accepts `WorkingDayOptions` with a custom `weekends` set and an optional injected
    `holidays` predicate, so core stays dependency-free.
  - `@doranjs/holidays` — holiday-aware wrappers of the above (`isWorkingDay`,
    `addWorkingDays`, `nextWorkingDay`, `previousWorkingDay`, `workingDaysBetween`) that
    default the `holidays` predicate to the package's official-holiday `isHoliday`.
  - `@doranjs/nlp` — `parseRange` («از ۵ تا ۱۰ فروردین»), `parseDuration` («یک ساعت و
    نیم»), and `parseRecurrence` («هر دوشنبه», «هر دو هفته») plus an `occurrences` helper
    that expands a recurrence into concrete dates.
  - `@doranjs/react` & `@doranjs/wc` — `DoranRangePicker` / `<doran-rangepicker>` gain
    quick-pick `presets` (defaults: last 7/30 days, this month, this year) and a
    side-by-side multi-month view (`numberOfMonths` / `months`). The React `useDateRange`
    hook exposes a new `setRange`, and `defaultRangePresets` is exported from both packages.

## 0.0.2

### Patch Changes

- [`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d) Thanks [@amiralibg](https://github.com/amiralibg)! - Round out the `DoranDate` API toward moment-jalaali parity:
  - Setters: `set`, `with`, and `withYear`/`withMonth`/`withDay`/`withHour`/`withMinute`/
    `withSecond`/`withMillisecond` (immutable; the day is clamped to the target month).
  - Relative time: `fromNow`, `from`, `to`, `toNow`, backed by a locale `relativeTime`
    bundle (Persian + English).
  - New statics and helpers: `DoranDate.min`/`max`/`isValid`, `daysInYear`, and
    `isToday`/`isTomorrow`/`isYesterday`.
  - `quarter` is now a full unit (`add`/`startOf`/`endOf`/`diff`) with a `Q` format token,
    and `isBetween` accepts an inclusivity argument (`'[]' | '()' | '[)' | '(]'`).

## 0.0.1

### Patch Changes

- [`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of `@doranjs/core`: the immutable `DoranDate` engine with accurate
  Gregorian ↔ Jalali conversion, leap-year support, calendar-aware arithmetic, parsing,
  token-based formatting, time-zone support via `Intl`, and a pluggable locale system.
