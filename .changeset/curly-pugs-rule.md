---
'@doranjs/core': patch
---

Round out the `DoranDate` API toward moment-jalaali parity:

- Setters: `set`, `with`, and `withYear`/`withMonth`/`withDay`/`withHour`/`withMinute`/
  `withSecond`/`withMillisecond` (immutable; the day is clamped to the target month).
- Relative time: `fromNow`, `from`, `to`, `toNow`, backed by a locale `relativeTime`
  bundle (Persian + English).
- New statics and helpers: `DoranDate.min`/`max`/`isValid`, `daysInYear`, and
  `isToday`/`isTomorrow`/`isYesterday`.
- `quarter` is now a full unit (`add`/`startOf`/`endOf`/`diff`) with a `Q` format token,
  and `isBetween` accepts an inclusivity argument (`'[]' | '()' | '[)' | '(]'`).
