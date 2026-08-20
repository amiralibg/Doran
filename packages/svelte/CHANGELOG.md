# @doranjs/svelte

## 0.3.3

### Patch Changes

- Updated dependencies [[`22261ef`](https://github.com/amiralibg/Doran/commit/22261effb5b24d7d2a9a25d8adb36e3365f8e582)]:
  - @doranjs/wc@0.6.0

## 0.3.2

### Patch Changes

- Updated dependencies [[`ff4d608`](https://github.com/amiralibg/Doran/commit/ff4d608a3f62a03f08c5ebc844b9955872683f08)]:
  - @doranjs/wc@0.5.0

## 0.3.1

### Patch Changes

- Updated dependencies [[`e9e9e0e`](https://github.com/amiralibg/Doran/commit/e9e9e0e73e2700e5e7daed58878dd3212cea9f35)]:
  - @doranjs/core@0.3.0
  - @doranjs/wc@0.4.0

## 0.3.0

### Minor Changes

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Add day widgets and calendar slots.

  Days can now carry your own content — a fare, a seat count, an availability badge —
  and the regions around the grid can be filled with your own components. Closes #52.

  **Per-day content.** React gets two render functions; every framework gets a
  serializable map that also works from plain HTML.

  ```tsx
  <DoranDatePicker
    dayContent={(day) => <Fare value={fares[dayKey(day)]} />}
    dayProps={(day, meta) => ({ 'data-cheapest': isCheapest(day) || undefined })}
  />
  ```

  ```js
  picker.dayData = { '1404-5-12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' } };
  ```

  `dayData` keys are Jalali `YYYY-M-D`, and zero-padded or Persian-digit forms resolve
  to the same day.

  **`disabledDates`.** Days could previously only be blocked by `min`/`max`. Blackout
  dates, booked nights, and sold-out departures are now expressible, with a
  `disabledReason` that becomes both a tooltip and part of the day's accessible name.

  **Slots.** `legend`, `aside`, and `footer` accept your own content — via a `slots`
  prop in React, and light-DOM `<div slot="…">` children everywhere else, which Vue,
  Svelte, and Angular templates fill natively. `useDoranCalendar()` gives that content
  the calendar's state and navigation, so a slot widget can drive the calendar rather
  than just decorate it.

  **Holidays in React.** `@doranjs/react/holidays` exports `useHolidays()` and
  `createHolidayHelpers()`, closing the gap where `@doranjs/wc` had Iranian holidays
  built in and React did not. It ships as a subpath, so the dataset only enters bundles
  that import it, and it indexes each year once instead of re-resolving per day.

  **Accessibility.** Unavailable days now use `aria-disabled` rather than the `disabled`
  attribute, so they stay focusable and can announce why they cannot be picked; arrow
  navigation skips `min`/`max` gaps but lands on individually blocked days. A polite
  live region announces the focused day, including when navigation crosses a month
  boundary and the grid re-renders.

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Bring the range trigger to every framework.

  React gained `DoranRangeDatePicker` — a range picker with an input trigger — but web
  components only had the inline `<doran-rangepicker>`, so Vue, Svelte, Angular, and
  plain-HTML users had no way to get one.

  `<doran-rangedatepicker>` closes that: one trigger holding two fields, either typable
  or fillable from the grid, with the same ordering guarantee (an end before the start
  swaps them), the same `mode="sheet"` presentation, and the same `dayData`,
  `disabledDates`, and slot support. It is exposed as `DoranRangeDatePicker` from
  `@doranjs/vue` and `@doranjs/svelte`, and as `<dr-range-date-picker>` from
  `@doranjs/angular`.

  Also fixed: `DoranDatePicker` in `@doranjs/svelte` forwarded only its default slot, so
  `legend`, `aside`, and `footer` never reached the element the way they did on the
  calendar and range picker.

### Patch Changes

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Survive two installed copies of `@doranjs/core`.

  Published packages pinned `@doranjs/core` to an exact version, because pnpm rewrites
  `workspace:*` that way. When a consumer upgraded one Doran package without the others,
  their pins diverged and npm installed two copies — at which point
  `value instanceof DoranDate` returned `false` for a date built by the other copy, and
  `@doranjs/zod` silently rejected perfectly valid dates as unparseable.

  `DoranDate` now carries a `Symbol.for('doran.date')` brand. Registered symbols live in
  a global registry shared by every copy of a module, so the new `isDoranDate()` guard
  recognizes instances across copies where `instanceof` cannot. It replaces the
  cross-boundary `instanceof` checks in `@doranjs/zod` and in core's own `toDoranDate`.

  Internal `@doranjs/*` ranges also move from `workspace:*` to `workspace:^`, so they
  publish as caret ranges rather than exact pins. This is strictly a widening — existing
  lockfiles are untouched and new installs can only dedupe better.

  One limit worth knowing: below 1.0, `^0.2.0` does not admit `0.3.0`, so carets prevent
  duplicates only within a minor line. Fully solving cross-minor divergence needs a 1.0,
  where a caret spans every minor. The brand makes the remaining cases degrade gracefully
  rather than silently.

- Updated dependencies [[`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e)]:
  - @doranjs/core@0.2.0
  - @doranjs/wc@0.3.0

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
