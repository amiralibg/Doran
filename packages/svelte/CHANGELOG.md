# @doranjs/svelte

## 0.2.5

### Patch Changes

- Updated dependencies [[`6335e77`](https://github.com/amiralibg/Doran/commit/6335e7728f1f5603e3a78b3d94d1821992e223e7)]:
  - @doranjs/core@0.1.3
  - @doranjs/wc@0.2.4

## 0.2.4

### Patch Changes

- Updated dependencies [[`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d)]:
  - @doranjs/core@0.1.2
  - @doranjs/wc@0.2.3

## 0.2.3

### Patch Changes

- Updated dependencies [[`042946a`](https://github.com/amiralibg/Doran/commit/042946a1a544c847a6de9580f54ab34ef8c244bd)]:
  - @doranjs/wc@0.2.2

## 0.2.2

### Patch Changes

- Updated dependencies [[`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302)]:
  - @doranjs/core@0.1.1
  - @doranjs/wc@0.2.1

## 0.2.1

### Patch Changes

- Updated dependencies [[`912981e`](https://github.com/amiralibg/Doran/commit/912981e93314414849fe2af80a90008596e8df61)]:
  - @doranjs/wc@0.2.0

## 0.2.0

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
