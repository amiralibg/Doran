---
'@doranjs/svelte': minor
---

**New package `@doranjs/svelte`** — idiomatic Svelte bindings (second framework of [#22](https://github.com/amiralibg/Doran/issues/22)).

- `bind:value` components over the `@doranjs/wc` engine (no per-framework grid logic): `DoranDatePicker`, `DoranCalendar`, `DoranRangePicker`, `DoranNlpInput`, `DoranAgenda`.
- Same change convention as `@doranjs/react` / `@doranjs/vue`: `bind:value` carries a `DoranDate`, `change` also reports the Gregorian `Date` (range picker reports `{ start, end }`).
- Headless `createCalendarGrid()` store reusing the shared `buildMonthGrid` / `navigateFocus`.
- Works with Svelte 4 and 5; SSR-safe (elements load client-side on mount). Angular binding follows.
