# @doranjs/vue

## 0.1.0

### Minor Changes

- [#34](https://github.com/amiralibg/Doran/pull/34) [`88d481c`](https://github.com/amiralibg/Doran/commit/88d481c9a9f0a4ac3dda613aede5d6f8c9f6308e) Thanks [@amiralibg](https://github.com/amiralibg)! - **New package `@doranjs/vue`** — idiomatic Vue 3 bindings (first of the framework-bindings effort, [#22](https://github.com/amiralibg/Doran/issues/22)).
  - `v-model` components over the `@doranjs/wc` engine (no per-framework grid logic): `DoranDatePicker`, `DoranCalendar`, `DoranRangePicker`, `DoranNlpInput`, `DoranAgenda`.
  - Same change convention as `@doranjs/react`: `v-model` carries a `DoranDate`, `change` also emits the Gregorian `Date` (range picker emits `{ start, end }`).
  - Headless `useCalendarGrid()` composable reusing the shared `buildMonthGrid` / `navigateFocus`.
  - SSR-safe (elements load client-side on mount). Svelte and Angular bindings follow.

- [#34](https://github.com/amiralibg/Doran/pull/34) [`9377be6`](https://github.com/amiralibg/Doran/commit/9377be60be96c2525f9a897f8504fbe932cc122f) Thanks [@amiralibg](https://github.com/amiralibg)! - **SSR-safe `DoranProvider` for every framework binding** ([#26](https://github.com/amiralibg/Doran/issues/26)).

  Locale (Persian vs Latin digits) and time zone can differ between server and client, causing hydration mismatches. Each binding now ships a request-scoped provider that sets subtree defaults without touching the mutable global `setDefaultLocale()`:
  - `DoranProvider` for React (Context), Vue (`provide`/`inject`), Svelte (context), and Angular (`dr-provider`, DI token `DORAN_DEFAULTS`).
  - Components resolve their locale as **explicit prop → provider → global default**; React takes a `Locale` object, the wc-based bindings take the `locale` attribute string (`'fa'`/`'en'`).
  - New **"Doran with SSR"** guide covering hydration pitfalls across Next.js, Nuxt, SvelteKit, and Angular Universal.
