---
'@doranjs/vue': minor
---

**New package `@doranjs/vue`** — idiomatic Vue 3 bindings (first of the framework-bindings effort, [#22](https://github.com/amiralibg/Doran/issues/22)).

- `v-model` components over the `@doranjs/wc` engine (no per-framework grid logic): `DoranDatePicker`, `DoranCalendar`, `DoranRangePicker`, `DoranNlpInput`, `DoranAgenda`.
- Same change convention as `@doranjs/react`: `v-model` carries a `DoranDate`, `change` also emits the Gregorian `Date` (range picker emits `{ start, end }`).
- Headless `useCalendarGrid()` composable reusing the shared `buildMonthGrid` / `navigateFocus`.
- SSR-safe (elements load client-side on mount). Svelte and Angular bindings follow.
