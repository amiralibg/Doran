---
'@doranjs/angular': minor
---

**New package `@doranjs/angular`** — idiomatic Angular bindings, completing the framework trio of [#22](https://github.com/amiralibg/Doran/issues/22).

- Standalone components over the `@doranjs/wc` engine (no per-framework grid logic): `DoranDatePicker`, `DoranCalendar`, `DoranRangePicker`, `DoranNlpInput`, `DoranAgenda`.
- Implement `ControlValueAccessor`, so they drop into reactive and template-driven forms.
- Same change convention as `@doranjs/react` / `@doranjs/vue` / `@doranjs/svelte`: the form value is a `DoranDate`, `(change)` also reports the Gregorian `Date` (range picker reports `{ start, end }`).
- Headless `createCalendarGrid()` built on Angular signals, reusing the shared `buildMonthGrid` / `navigateFocus`.
- Works with Angular 19 and 20; SSR-safe (elements load client-side on init). Ships partial-Ivy output via `ngc`.
