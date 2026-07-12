# @doranjs/holidays

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
