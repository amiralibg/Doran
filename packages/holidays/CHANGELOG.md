# @doranjs/holidays

## 0.1.0

### Minor Changes

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Report holiday coverage, and make the components usable without the stylesheet.

  **Holiday coverage.** Iran announces its religious holidays by moon sighting, so no
  library can compute them exactly in advance — authoritative dates are on file for 1404
  and 1405, and every other year falls back to a tabular approximation that can land a
  day either side. Rather than invent the missing years, this exposes which ones are
  announced:

  ```ts
  const { official, approximate } = getHolidayCoverage(1410);
  if (!official) showNotice('Religious holidays for this year are estimates.');
  ```

  New in `@doranjs/holidays`: `getHolidayCoverage`, `getOfficialLunarYears`, and
  `hasOfficialLunarDates`. Surfaced in React as `useHolidays().coverage(year)`. Feed your
  own announced dates with the existing `registerOfficialLunarYear`.

  **Unstyled usage.** Skipping `@doranjs/react/styles.css` already gave you the markup,
  keyboard model, and ARIA with no visual opinions — except that the day-navigation live
  region's visually-hidden styling lived only in the stylesheet, so an app that skipped
  the CSS printed every announcement on screen. That is behaviour rather than
  decoration, so it is now inlined.

  `classNames` also reaches further: `DoranCalendar` takes `{ root, footer, footerAction,
month }`, and `DoranMonthView` takes `{ grid, weekdays, weekday, week, cell, day }`.
  Your classes merge with Doran's rather than replacing them.

  **Not shipped: a `@doranjs/react/nlp` subpath.** Measured rather than assumed —
  esbuild produces 15.96 kB gzipped without `DoranNlpInput` and 22.24 kB with it, and
  Rollup agrees. `@doranjs/nlp` already tree-shakes, costing 6.3 kB gzipped only when
  imported, so a subpath would add an entry point and a migration for no gain. CJS
  consumers do not tree-shake and will still pull it in.

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

## 0.0.8

### Patch Changes

- Updated dependencies [[`6335e77`](https://github.com/amiralibg/Doran/commit/6335e7728f1f5603e3a78b3d94d1821992e223e7)]:
  - @doranjs/core@0.1.3

## 0.0.7

### Patch Changes

- Updated dependencies [[`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d)]:
  - @doranjs/core@0.1.2

## 0.0.6

### Patch Changes

- Updated dependencies [[`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302)]:
  - @doranjs/core@0.1.1

## 0.0.5

### Patch Changes

- Updated dependencies [[`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6), [`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6)]:
  - @doranjs/core@0.1.0

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

- [`015c983`](https://github.com/amiralibg/Doran/commit/015c9834c1d7235c88f8a6318dcfcbf64a79c08c) Thanks [@amiralibg](https://github.com/amiralibg)! - Improve holiday coverage and accuracy:
  - Broadened the dataset with many cultural observances and added descriptions.
  - Added `hijriMonthLength` and clamp end-of-month lunar occasions (e.g. آخر صفر) so they
    never overflow into the next month.
  - Added authoritative **per-year official date overrides** (seeded for 1404 and 1405) that
    take precedence over the approximate tabular calc, plus `registerOfficialLunarYear` to
    keep future years exact. Unseeded years still resolve via the tabular calendar, flagged
    `approximate`.

- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d)]:
  - @doranjs/core@0.0.2

## 0.0.1

### Patch Changes

- [`015c983`](https://github.com/amiralibg/Doran/commit/015c9834c1d7235c88f8a6318dcfcbf64a79c08c) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of `@doranjs/holidays`: exact solar (Jalali) national/cultural holidays,
  computed religious (lunar) holidays via a calibrated tabular Hijri calendar, custom
  holiday registration, and `getHolidays` / `isHoliday` / `getHolidaysOn` lookups.
- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d)]:
  - @doranjs/core@0.0.1
