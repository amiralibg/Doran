---
'@doranjs/core': patch
'@doranjs/holidays': patch
'@doranjs/nlp': patch
'@doranjs/react': patch
'@doranjs/wc': patch
---

Working-day arithmetic, natural-language ranges/durations/recurrence, and range-picker
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
