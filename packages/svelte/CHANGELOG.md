# @doranjs/svelte

## 0.1.1

### Patch Changes

- [#37](https://github.com/amiralibg/Doran/pull/37) [`7632e12`](https://github.com/amiralibg/Doran/commit/7632e12d07a92018c4737defa0a15e8e03c38401) Thanks [@amiralibg](https://github.com/amiralibg)! - Fix `DoranAgenda` dropping `start`, `events`, and `renderEvent`. These are element
  properties (not attributes), so the binding now assigns them after the lazy
  `@doranjs/wc` import upgrades the custom element — the same post-upgrade sync the
  other components use for `value`. Previously they were spread through `$$restProps`
  and lost, so the agenda rendered today's week with no events.
- Updated dependencies [[`415466c`](https://github.com/amiralibg/Doran/commit/415466cd17649fcc31d7fe3ced0bebc29e1231d8)]:
  - @doranjs/wc@0.0.10

## 0.1.0

### Minor Changes

- [#34](https://github.com/amiralibg/Doran/pull/34) [`be41749`](https://github.com/amiralibg/Doran/commit/be417498b17622162b16685bc4aa588a0043c72d) Thanks [@amiralibg](https://github.com/amiralibg)! - **New package `@doranjs/svelte`** — idiomatic Svelte bindings (second framework of [#22](https://github.com/amiralibg/Doran/issues/22)).
  - `bind:value` components over the `@doranjs/wc` engine (no per-framework grid logic): `DoranDatePicker`, `DoranCalendar`, `DoranRangePicker`, `DoranNlpInput`, `DoranAgenda`.
  - Same change convention as `@doranjs/react` / `@doranjs/vue`: `bind:value` carries a `DoranDate`, `change` also reports the Gregorian `Date` (range picker reports `{ start, end }`).
  - Headless `createCalendarGrid()` store reusing the shared `buildMonthGrid` / `navigateFocus`.
  - Works with Svelte 4 and 5; SSR-safe (elements load client-side on mount). Angular binding follows.

- [#34](https://github.com/amiralibg/Doran/pull/34) [`9377be6`](https://github.com/amiralibg/Doran/commit/9377be60be96c2525f9a897f8504fbe932cc122f) Thanks [@amiralibg](https://github.com/amiralibg)! - **SSR-safe `DoranProvider` for every framework binding** ([#26](https://github.com/amiralibg/Doran/issues/26)).

  Locale (Persian vs Latin digits) and time zone can differ between server and client, causing hydration mismatches. Each binding now ships a request-scoped provider that sets subtree defaults without touching the mutable global `setDefaultLocale()`:
  - `DoranProvider` for React (Context), Vue (`provide`/`inject`), Svelte (context), and Angular (`dr-provider`, DI token `DORAN_DEFAULTS`).
  - Components resolve their locale as **explicit prop → provider → global default**; React takes a `Locale` object, the wc-based bindings take the `locale` attribute string (`'fa'`/`'en'`).
  - New **"Doran with SSR"** guide covering hydration pitfalls across Next.js, Nuxt, SvelteKit, and Angular Universal.
