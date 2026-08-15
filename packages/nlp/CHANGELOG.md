# @doranjs/nlp

## 0.1.6

### Patch Changes

- Updated dependencies [[`e9e9e0e`](https://github.com/amiralibg/Doran/commit/e9e9e0e73e2700e5e7daed58878dd3212cea9f35)]:
  - @doranjs/core@0.3.0

## 0.1.5

### Patch Changes

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Survive two installed copies of `@doranjs/core`.

  Published packages pinned `@doranjs/core` to an exact version, because pnpm rewrites
  `workspace:*` that way. When a consumer upgraded one Doran package without the others,
  their pins diverged and npm installed two copies — at which point
  `value instanceof DoranDate` returned `false` for a date built by the other copy, and
  `@doranjs/zod` silently rejected perfectly valid dates as unparseable.

  `DoranDate` now carries a `Symbol.for('doran.date')` brand. Registered symbols live in
  a global registry shared by every copy of a module, so the new `isDoranDate()` guard
  recognizes instances across copies where `instanceof` cannot. It replaces the
  cross-boundary `instanceof` checks in `@doranjs/zod` and in core's own `toDoranDate`.

  Internal `@doranjs/*` ranges also move from `workspace:*` to `workspace:^`, so they
  publish as caret ranges rather than exact pins. This is strictly a widening — existing
  lockfiles are untouched and new installs can only dedupe better.

  One limit worth knowing: below 1.0, `^0.2.0` does not admit `0.3.0`, so carets prevent
  duplicates only within a minor line. Fully solving cross-minor divergence needs a 1.0,
  where a caret spans every minor. The brand makes the remaining cases degrade gracefully
  rather than silently.

- Updated dependencies [[`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e)]:
  - @doranjs/core@0.2.0

## 0.1.4

### Patch Changes

- Updated dependencies [[`6335e77`](https://github.com/amiralibg/Doran/commit/6335e7728f1f5603e3a78b3d94d1821992e223e7)]:
  - @doranjs/core@0.1.3

## 0.1.3

### Patch Changes

- Updated dependencies [[`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d)]:
  - @doranjs/core@0.1.2

## 0.1.2

### Patch Changes

- Updated dependencies [[`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302)]:
  - @doranjs/core@0.1.1

## 0.1.1

### Patch Changes

- Updated dependencies [[`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6), [`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6)]:
  - @doranjs/core@0.1.0

## 0.1.0

### Minor Changes

- [#14](https://github.com/amiralibg/Doran/pull/14) [`b125d4b`](https://github.com/amiralibg/Doran/commit/b125d4bfc24c6cb980cefab8669c9e55452649fd) Thanks [@amiralibg](https://github.com/amiralibg)! - Broaden natural-language date parsing to cover more ways users phrase dates:
  - Compound number-word days and counts (`بیست و یکم خرداد`), plus number words up to the
    hundreds (`صد و بیست و سه`).
  - More relative days: `امشب`, `دیشب`, `پریشب`.
  - Anchored named months (`اول فروردین`, `اوایل خرداد`, `اواخر اسفند`) and the
    `اوایل/اواسط/اواخر` anchors.
  - Weekday + week shift (`جمعه هفته بعد`, `شنبه هفته گذشته`) resolved to the correct week.
  - Relative-year qualifiers fold into an explicit date that omits its own year, so
    `۳ سال دیگه ۱۱ دی` resolves to 11 Dey of the +3 year (not the current year).
  - Tolerance for the colloquial ezafe «ی» in unit phrases (`هفته‌ی بعد`).
  - Extra parts of day: `نیمروز`, `سحر`, `شامگاه`.
  - `parseRange` now accepts the `(ما)بین X و Y` form; `parseRecurrence` understands
    `یک روز در میان` (every other day) and `هر <part-of-day>` (e.g. `هر شب`).
  - More Finglish aliases (`emshab`, `dishab`, spaced compound weekdays like `panj shanbe`,
    recurrence adverbs).

  The `DoranNlpInput` / `<doran-nlp-input>` resolved-date preview now shows the year when it
  differs from the current year, so dates that resolve to another year are no longer ambiguous.

## 0.0.4

### Patch Changes

- [#12](https://github.com/amiralibg/Doran/pull/12) [`61081b7`](https://github.com/amiralibg/Doran/commit/61081b70894f1b15830e87cd28ab8958803ca080) Thanks [@amiralibg](https://github.com/amiralibg)! - Migrate the build toolchain from `tsup` (no longer maintained) to
  [`tsdown`](https://tsdown.dev) (rolldown-based). The published output is
  equivalent: same `.js`/`.cjs` + `.d.ts`/`.d.cts` entry points and sourcemaps, the
  React and Web Component stylesheets ship unchanged, and `@doranjs/wc` still emits its
  self-registering `dist/doran.global.js` IIFE bundle for CDN use. No API or runtime
  behavior changes.
- Updated dependencies [[`61081b7`](https://github.com/amiralibg/Doran/commit/61081b70894f1b15830e87cd28ab8958803ca080)]:
  - @doranjs/core@0.0.4

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

- Updated dependencies [[`5ae247a`](https://github.com/amiralibg/Doran/commit/5ae247a58476585a2a9aa8062780ad8aac3d3805)]:
  - @doranjs/core@0.0.3

## 0.0.2

### Patch Changes

- [`4362f94`](https://github.com/amiralibg/Doran/commit/4362f945148e1618b4b432c1e52d04be94146587) Thanks [@amiralibg](https://github.com/amiralibg)! - Expand and harden the Persian date parser:
  - Understands more expressions: explicit and numeric dates (`۱۵ خرداد`, `۱۴۰۵/۰۳/۲۰`),
    `این هفته/ماه`, `آخر هفته`, time fractions and "to" forms (`ساعت ۷ و نیم`, `یک ربع به ۸`),
    and correct `۱۲ شب`/`۱۲ ظهر` handling.
  - New `suggest()` autocomplete API with properly half-spaced (ZWNJ) labels.
  - Forgiving input: folds spelling variants, remaps text typed with the keyboard left in
    English (`tvnh` → «فردا»), and accepts Finglish (`jomeh saat 7 shab`). New exports:
    `remapKeyboard`, `transliterateFinglish`, `registerFinglish`.

- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d)]:
  - @doranjs/core@0.0.2

## 0.0.1

### Patch Changes

- [`4362f94`](https://github.com/amiralibg/Doran/commit/4362f945148e1618b4b432c1e52d04be94146587) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of `@doranjs/nlp`: a modular, extensible Persian natural-language date
  parser. Understands relative days, weekdays, unit arithmetic, month anchors, special
  days, and time-of-day expressions, returning a `DoranDate` with a confidence score.
- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d)]:
  - @doranjs/core@0.0.1
