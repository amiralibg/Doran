# @doranjs/angular

## 0.1.0

### Minor Changes

- [#34](https://github.com/amiralibg/Doran/pull/34) [`d0a7f20`](https://github.com/amiralibg/Doran/commit/d0a7f2000d82df9167b8d4cce9d16572e79cd5ed) Thanks [@amiralibg](https://github.com/amiralibg)! - **New package `@doranjs/angular`** — idiomatic Angular bindings, completing the framework trio of [#22](https://github.com/amiralibg/Doran/issues/22).
  - Standalone components over the `@doranjs/wc` engine (no per-framework grid logic): `DoranDatePicker`, `DoranCalendar`, `DoranRangePicker`, `DoranNlpInput`, `DoranAgenda`.
  - Implement `ControlValueAccessor`, so they drop into reactive and template-driven forms.
  - Same change convention as `@doranjs/react` / `@doranjs/vue` / `@doranjs/svelte`: the form value is a `DoranDate`, `(change)` also reports the Gregorian `Date` (range picker reports `{ start, end }`).
  - Headless `createCalendarGrid()` built on Angular signals, reusing the shared `buildMonthGrid` / `navigateFocus`.
  - Works with Angular 19 and 20; SSR-safe (elements load client-side on init). Ships partial-Ivy output via `ngc`.

- [#34](https://github.com/amiralibg/Doran/pull/34) [`9377be6`](https://github.com/amiralibg/Doran/commit/9377be60be96c2525f9a897f8504fbe932cc122f) Thanks [@amiralibg](https://github.com/amiralibg)! - **SSR-safe `DoranProvider` for every framework binding** ([#26](https://github.com/amiralibg/Doran/issues/26)).

  Locale (Persian vs Latin digits) and time zone can differ between server and client, causing hydration mismatches. Each binding now ships a request-scoped provider that sets subtree defaults without touching the mutable global `setDefaultLocale()`:
  - `DoranProvider` for React (Context), Vue (`provide`/`inject`), Svelte (context), and Angular (`dr-provider`, DI token `DORAN_DEFAULTS`).
  - Components resolve their locale as **explicit prop → provider → global default**; React takes a `Locale` object, the wc-based bindings take the `locale` attribute string (`'fa'`/`'en'`).
  - New **"Doran with SSR"** guide covering hydration pitfalls across Next.js, Nuxt, SvelteKit, and Angular Universal.
