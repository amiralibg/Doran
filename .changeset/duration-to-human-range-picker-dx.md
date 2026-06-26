---
'@doranjs/core': minor
'@doranjs/react': minor
---

**`@doranjs/core`**

- `durationToHuman(seconds, locale?)` — standalone duration humanizer replacing `moment.duration(s, 'seconds').humanize()`. Uses the global default locale when none is given.

**`@doranjs/react`**

- `DoranRangePicker` / `useDateRange`: `onChange` now receives a second argument `gregorian: GregorianDateRange` (`{ start: Date | null; end: Date | null }`) so you can post Gregorian ISO strings to your backend without extra conversion.
- `DoranRangePicker`: `locale` prop now falls back to `getDefaultLocale()` (consistent with `DoranDatePicker`).
- New exported type: `GregorianDateRange`.
