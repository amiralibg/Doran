---
'@doranjs/core': minor
---

**Breaking fix:** `toISOString()` and `toJSON()` now return a standard Gregorian UTC ISO-8601 string (e.g. `"2026-05-31T10:09:05.000Z"`), matching `Date`, `dayjs`, and `moment` — making `JSON.stringify({ d: DoranDate.now() })` safe to send to any backend without extra conversion.

**Migration:** if you relied on the previous Jalali ISO output, replace `.toISOString()` with `.toJalaliISO()`.

New methods added:

- `toJalaliISO()` — the former `toISOString()` behaviour (Jalali calendar, local offset)
- `toGregorianISO()` — explicit alias for the new `toISOString()`
- `toGregorianParts()` — Gregorian wall-clock fields in the instance's time zone
- `formatGregorian(pattern)` — format with Gregorian fields using the same token vocabulary
- `unix()` — epoch seconds (moment/dayjs parity)
- `toMillis()` — epoch milliseconds as a method (dayjs parity)
