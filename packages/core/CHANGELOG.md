# @doranjs/core

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
