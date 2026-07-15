# @doranjs/angular

## 0.4.3

### Patch Changes

- Updated dependencies [[`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d)]:
  - @doranjs/core@0.1.2
  - @doranjs/wc@0.2.3

## 0.4.2

### Patch Changes

- Updated dependencies [[`042946a`](https://github.com/amiralibg/Doran/commit/042946a1a544c847a6de9580f54ab34ef8c244bd)]:
  - @doranjs/wc@0.2.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302)]:
  - @doranjs/core@0.1.1
  - @doranjs/wc@0.2.1

## 0.4.0

### Minor Changes

- [#42](https://github.com/amiralibg/Doran/pull/42) [`912981e`](https://github.com/amiralibg/Doran/commit/912981e93314414849fe2af80a90008596e8df61) Thanks [@amiralibg](https://github.com/amiralibg)! - Make date-picker footer actions configurable, make Today select the current date, and
  add nullable Clear events plus trigger alignment and input/dropdown width controls.

### Patch Changes

- Updated dependencies [[`912981e`](https://github.com/amiralibg/Doran/commit/912981e93314414849fe2af80a90008596e8df61)]:
  - @doranjs/wc@0.2.0

## 0.3.0

### Minor Changes

- [#40](https://github.com/amiralibg/Doran/pull/40) [`1321a2d`](https://github.com/amiralibg/Doran/commit/1321a2d5893ac3ff507041f0615a36242e772f83) Thanks [@amiralibg](https://github.com/amiralibg)! - Smarter pop-overs and customizable trigger icons.

  **Pop-overs can no longer be clipped.** The date-picker calendar and the NLP-input
  suggestions list are now rendered in a portal on `document.body` and positioned
  `fixed` from the trigger rect, so they always appear on top of the page — even when
  the picker sits inside a card, modal, or table cell with `overflow: hidden/auto`.
  They stay glued to the trigger while scrolling, flip above when there is no room
  below, clamp to the viewport, and sit at `z-index: var(--doran-z-popover, 9999)`.
  This applies to every framework package (React natively; Vue, Svelte, and Angular
  via the shared web components).

  **The trigger icon is now yours.** React: `icon={<MyIcon />}` replaces the default
  calendar icon and `icon={null}` hides it. Web components (and therefore Vue/Svelte/
  Angular): add the `hide-icon` attribute to hide it, or pass a custom node as a
  light-DOM child — `<doran-datepicker><svg slot="icon" …></doran-datepicker>`.
  Angular additionally exposes a `hideIcon` input and projects children into the
  element.

### Patch Changes

- Updated dependencies [[`1321a2d`](https://github.com/amiralibg/Doran/commit/1321a2d5893ac3ff507041f0615a36242e772f83)]:
  - @doranjs/wc@0.1.0

## 0.2.0

### Minor Changes

- [#37](https://github.com/amiralibg/Doran/pull/37) [`c51a742`](https://github.com/amiralibg/Doran/commit/c51a742d375dcf6638da01f34f5c01c962dcb048) Thanks [@amiralibg](https://github.com/amiralibg)! - Make the Angular components work client-side and reach feature parity with the
  other bindings.
  - **Fix:** element properties (`value`, agenda `events`) were assigned in
    `ngAfterViewInit` — before the lazy `@doranjs/wc` import upgrades the element —
    so the assignment created an expando that shadowed the element's setter and
    never rendered. Every component now applies its value after the element upgrades
    (`ensureElements().then(...)`), gated by a `ready` flag.
  - **Fix:** `locale` now re-applies on change (via `ngOnChanges`), so switching
    locale at runtime updates the calendar.
  - **New inputs** forwarding the underlying element's options:
    `dr-calendar` — `headerMode`, `withTime`, `showHolidays`, `weekends`,
    `hideFooter`, `yearSpan`; `dr-date-picker` — `placeholder`, `format`,
    `withTime`; `dr-range-picker` — `headerMode`, `showHolidays`, `weekends`,
    `presets`, `months`, `yearSpan`; `dr-nlp-input` — `placeholder`; `dr-agenda` —
    `start`, `days`, `renderEvent` (previously only `events`/`locale`).

### Patch Changes

- [#37](https://github.com/amiralibg/Doran/pull/37) [`3ffaa11`](https://github.com/amiralibg/Doran/commit/3ffaa113a1d75a271bf2d6acaae2acd6c0f6b10a) Thanks [@amiralibg](https://github.com/amiralibg)! - Build in full Ivy compilation mode instead of partial. Partial (`ngDeclare`)
  output needs the Angular linker at build time; bundlers that don't run it (e.g.
  Vite via `@analogjs/vite-plugin-angular`, which skips `node_modules`) left the
  components unlinked, so consuming apps died at runtime with "JIT compiler
  unavailable". The peer dependency is pinned to a single Angular major, where
  full-compiled output is stable.
- Updated dependencies [[`415466c`](https://github.com/amiralibg/Doran/commit/415466cd17649fcc31d7fe3ced0bebc29e1231d8)]:
  - @doranjs/wc@0.0.10

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
