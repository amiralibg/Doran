# @doranjs/core

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
