---
'@doranjs/react': minor
---

All React components (`DoranCalendar`, `DoranMonthView`, `DoranAgenda`, `DoranTimePicker`, `DoranNlpInput`) now fall back to `getDefaultLocale()` instead of hardcoding `faIR`. A single `setDefaultLocale(enUS)` at the app root is now enough to switch every component — no per-instance `locale` prop needed.

`DoranNlpInput.onResolve` now receives a second argument `gregorian: Date | null` — the resolved instant as a native `Date` — consistent with `DoranDatePicker` and `DoranRangePicker`.
