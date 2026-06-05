---
'@doranjs/core': minor
---

Make `@doranjs/core` the most complete Persian calendar engine — surpassing
`moment-jalaali`, not just matching it. All additions are backward-compatible.

**New primitives**

- `Duration` (via `duration()`): Moment-compatible decomposition with `as*`/`get`/
  `humanize`/`toISOString`/arithmetic. `DoranDate.diffDuration(other)` returns one.
- `DoranRange`: an immutable interval with `contains`/`overlaps`/`intersect`/`by(unit)`
  iteration, `duration`/`asDuration`, and a default day-by-day iterator.

**New `DoranDate` surface**

- `calendar(reference?, formats?)` calendar-time phrases (today / tomorrow / …).
- `unix()` + `DoranDate.fromUnix(seconds)`, `toArray()`, `toDate()`.
- `week`, `weekYear`, `weeksInYear`, `season`, `seasonName` accessors. Week numbering now
  matches `moment-jalaali`'s `jWeek` / `jWeekYear` exactly (Saturday-first, `doy: 12`).

**Formatting & parsing**

- Localized tokens `L LL LLL LLLL LT LTS`, ordinals `Do Mo Qo wo`, plus `DDD DDDD`,
  `gggg gg`, `e E`, `k kk`, `SS S`, `X x`.
- `parseJalali` accepts an array of formats to try in order.
- `DoranDate.parse(input, formats?, options?)`: explicit formats parse as Jalali; otherwise
  a full Gregorian ISO-8601 instant is auto-detected, and everything else parses as Jalali.

**Locales**

- New `fa-AF` (Dari) locale with the traditional Afghan zodiacal month names.
- The `Locale` interface gained optional `longDateFormat`, `calendar`, `ordinal`,
  `seasons`, and `week` fields (populated for the built-in locales).

Behavior is permanently locked by a committed `moment-jalaali` parity fixture (verified
across 73,414 days); the parity test reads the fixture and carries no runtime dependency.
