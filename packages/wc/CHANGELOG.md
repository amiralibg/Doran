# @doranjs/wc

## 0.2.4

### Patch Changes

- Updated dependencies [[`6335e77`](https://github.com/amiralibg/Doran/commit/6335e7728f1f5603e3a78b3d94d1821992e223e7)]:
  - @doranjs/core@0.1.3
  - @doranjs/holidays@0.0.8
  - @doranjs/nlp@0.1.4

## 0.2.3

### Patch Changes

- Updated dependencies [[`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d)]:
  - @doranjs/core@0.1.2
  - @doranjs/holidays@0.0.7
  - @doranjs/nlp@0.1.3

## 0.2.2

### Patch Changes

- [#46](https://github.com/amiralibg/Doran/pull/46) [`042946a`](https://github.com/amiralibg/Doran/commit/042946a1a544c847a6de9580f54ab34ef8c244bd) Thanks [@amiralibg](https://github.com/amiralibg)! - Isolate the date-picker trigger value from the surrounding RTL context with
  `dir="auto"` so digit-only formats like `YYYY-MM-DD HH:mm` no longer render
  time-before-date when `textAlign` is set without an explicit direction.

## 0.2.1

### Patch Changes

- [#44](https://github.com/amiralibg/Doran/pull/44) [`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302) Thanks [@amiralibg](https://github.com/amiralibg)! - Localize calendar footer actions such as Today and Clear from the active locale instead of always showing Persian labels.

- Updated dependencies [[`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302)]:
  - @doranjs/core@0.1.1
  - @doranjs/holidays@0.0.6
  - @doranjs/nlp@0.1.2

## 0.2.0

### Minor Changes

- [#42](https://github.com/amiralibg/Doran/pull/42) [`912981e`](https://github.com/amiralibg/Doran/commit/912981e93314414849fe2af80a90008596e8df61) Thanks [@amiralibg](https://github.com/amiralibg)! - Make date-picker footer actions configurable, make Today select the current date, and
  add nullable Clear events plus trigger alignment and input/dropdown width controls.

## 0.1.0

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

## 0.0.10

### Patch Changes

- [#37](https://github.com/amiralibg/Doran/pull/37) [`415466c`](https://github.com/amiralibg/Doran/commit/415466cd17649fcc31d7fe3ced0bebc29e1231d8) Thanks [@amiralibg](https://github.com/amiralibg)! - Fix cross-framework binding issues surfaced by the Vue/Svelte/Angular demos.
  - **Range picker:** add a `value` setter (`{ start, end }`), so two-way bindings
    that assign the property (Vue `v-model`, Svelte `bind:value`, Angular
    `[formControl]`) work instead of throwing "Cannot set property value … which
    has only a getter".
  - **Range picker:** the `presets` property now tolerates a boolean. A bare
    `presets` attribute forwarded as a property (e.g. Svelte) arrives as `true`;
    it's treated as "show the defaults" rather than being iterated as a custom
    list (which produced `Invalid Jalali date: 0/0/1`).
  - **Range picker:** the `value`/`presets` setters no longer render before the
    element has initialized its view state — frameworks that set properties before
    the element connects no longer trigger a render against an empty (0/0/1) month.
  - **All components:** the `change`, `resolve`, `selectday`, and `input`
    CustomEvents no longer bubble. They collided with same-named framework outputs
    and native DOM events (e.g. Angular's `(resolve)` received the raw DOM event
    instead of the parsed result). Listen for them on the element directly, as all
    bindings and the vanilla example already do.

## 0.0.9

### Patch Changes

- Updated dependencies [[`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6), [`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6)]:
  - @doranjs/core@0.1.0
  - @doranjs/holidays@0.0.5
  - @doranjs/nlp@0.1.1

## 0.0.8

### Patch Changes

- [#14](https://github.com/amiralibg/Doran/pull/14) [`b125d4b`](https://github.com/amiralibg/Doran/commit/b125d4bfc24c6cb980cefab8669c9e55452649fd) Thanks [@amiralibg](https://github.com/amiralibg)! - Broaden natural-language date parsing to cover more ways users phrase dates:
  - Compound number-word days and counts (`بیست و یکم خرداد`), plus number words up to the
    hundreds (`صد و بیست و سه`).
  - More relative days: `امشب`, `دیشب`, `پریشب`.
  - Anchored named months (`اول فروردین`, `اوایل خرداد`, `اواخر اسفند`) and the
    `اوایل/اواسط/اواخر` anchors.
  - Weekday + week shift (`جمعه هفته بعد`, `شنبه هفته گذشته`) resolved to the correct week.
  - Relative-year qualifiers fold into an explicit date that omits its own year, so
    `۳ سال دیگه ۱۱ دی` resolves to 11 Dey of the +3 year (not the current year).
  - Tolerance for the colloquial ezafe «ی» in unit phrases (`هفته‌ی بعد`).
  - Extra parts of day: `نیمروز`, `سحر`, `شامگاه`.
  - `parseRange` now accepts the `(ما)بین X و Y` form; `parseRecurrence` understands
    `یک روز در میان` (every other day) and `هر <part-of-day>` (e.g. `هر شب`).
  - More Finglish aliases (`emshab`, `dishab`, spaced compound weekdays like `panj shanbe`,
    recurrence adverbs).

  The `DoranNlpInput` / `<doran-nlp-input>` resolved-date preview now shows the year when it
  differs from the current year, so dates that resolve to another year are no longer ambiguous.

- Updated dependencies [[`b125d4b`](https://github.com/amiralibg/Doran/commit/b125d4bfc24c6cb980cefab8669c9e55452649fd)]:
  - @doranjs/nlp@0.1.0

## 0.0.7

### Patch Changes

- [#12](https://github.com/amiralibg/Doran/pull/12) [`61081b7`](https://github.com/amiralibg/Doran/commit/61081b70894f1b15830e87cd28ab8958803ca080) Thanks [@amiralibg](https://github.com/amiralibg)! - Migrate the build toolchain from `tsup` (no longer maintained) to
  [`tsdown`](https://tsdown.dev) (rolldown-based). The published output is
  equivalent: same `.js`/`.cjs` + `.d.ts`/`.d.cts` entry points and sourcemaps, the
  React and Web Component stylesheets ship unchanged, and `@doranjs/wc` still emits its
  self-registering `dist/doran.global.js` IIFE bundle for CDN use. No API or runtime
  behavior changes.
- Updated dependencies [[`61081b7`](https://github.com/amiralibg/Doran/commit/61081b70894f1b15830e87cd28ab8958803ca080)]:
  - @doranjs/core@0.0.4
  - @doranjs/nlp@0.0.4
  - @doranjs/holidays@0.0.4

## 0.0.6

### Patch Changes

- [#10](https://github.com/amiralibg/Doran/pull/10) [`3a2d815`](https://github.com/amiralibg/Doran/commit/3a2d815e160cc206d3210ccba97896a2dc043b8b) Thanks [@amiralibg](https://github.com/amiralibg)! - Promote `@doranjs/react`, `@doranjs/wc`, and `@doranjs/ui` to stable. Each now ships a
  full DOM-level test suite (rendering, interaction, keyboard a11y, and event contracts)
  under `jsdom`, covering the calendar, date picker, range picker, time picker,
  natural-language input, and agenda components/elements, the `useCalendar`/`useDateRange`
  hooks, and the `Button`/`ThemeProvider` primitives. No runtime behavior changes.

## 0.0.5

### Patch Changes

- [#8](https://github.com/amiralibg/Doran/pull/8) [`b8a564a`](https://github.com/amiralibg/Doran/commit/b8a564a8c5c479c5b676434207650ebae84dbafb) Thanks [@amiralibg](https://github.com/amiralibg)! - Center the range picker's calendar within its body (`justify-content: center` on
  `.doran-rangepicker__body`), so a single-month picker no longer sits against the
  inline-start edge when the picker is wider than the calendar. The `@doranjs/wc`
  stylesheet, which bundles the React styles, ships the same fix.

## 0.0.4

### Patch Changes

- [#6](https://github.com/amiralibg/Doran/pull/6) [`5ae247a`](https://github.com/amiralibg/Doran/commit/5ae247a58476585a2a9aa8062780ad8aac3d3805) Thanks [@amiralibg](https://github.com/amiralibg)! - Working-day arithmetic, natural-language ranges/durations/recurrence, and range-picker
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

- Updated dependencies [[`5ae247a`](https://github.com/amiralibg/Doran/commit/5ae247a58476585a2a9aa8062780ad8aac3d3805)]:
  - @doranjs/core@0.0.3
  - @doranjs/holidays@0.0.3
  - @doranjs/nlp@0.0.3

## 0.0.3

### Patch Changes

- [#4](https://github.com/amiralibg/Doran/pull/4) [`b0a530e`](https://github.com/amiralibg/Doran/commit/b0a530e5a01f54bfcb233599450e4350ee2037f1) Thanks [@amiralibg](https://github.com/amiralibg)! - Accessibility: full WAI-ARIA keyboard navigation for the calendar grid.
  - Arrow keys move by day/week (RTL-aware), Home/End jump to the Saturday/Friday week
    edges, and **PageUp/PageDown** move by month (hold **Shift** for years). Arrowing or
    paging past the edge of the visible month now crosses month boundaries instead of
    stopping, with focus following the new month.
  - `@doranjs/react` — `DoranMonthView` tracks focus by date (roving tabindex), exposes an
    `onMonthChange` callback for cross-month focus, and labels the grid with the visible
    month/year (`aria-label`); range grids are marked `aria-multiselectable`. The new pure
    `navigateFocus(date, move)` helper is exported.
  - `@doranjs/wc` — `<doran-calendar>` and `<doran-rangepicker>` gain the same keyboard
    model (previously mouse-only) with roving tabindex and a labelled grid; range grids are
    marked `aria-multiselectable` with `aria-selected` cells. `navigateFocus` is exported.
  - Date-picker popovers (`DoranDatePicker` and `<doran-datepicker>`) now move focus into
    the calendar on open, restore it to the trigger on close/Escape, and trap Tab within
    the dialog.
  - `<doran-nlp-input>` links its combobox to the suggestion listbox via `aria-controls`,
    matching the React `DoranNlpInput`.

  New component for full React parity:
  - `@doranjs/wc` — adds `<doran-agenda>` (the `DoranAgenda` equivalent): a vertical,
    RTL-first day-by-day event list. Set `start`/`days`/`locale` plus an `events` array
    (and optional `renderEvent` formatter) as properties; clicking a day emits a
    `selectday` event. With this, every React component now has a Web Component counterpart.

## 0.0.2

### Patch Changes

- [#2](https://github.com/amiralibg/Doran/pull/2) [`774382b`](https://github.com/amiralibg/Doran/commit/774382b1ddb0261d0fe101ed87abadc2a2b88a53) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of `@doranjs/wc` — framework-agnostic Web Components for the Persian
  (Jalali) calendar. Registers `<doran-calendar>`, `<doran-datepicker>`,
  `<doran-rangepicker>`, and `<doran-nlp-input>` custom elements (built on the headless
  core, `@doranjs/nlp`, and `@doranjs/holidays`), usable in plain HTML or any framework.
  Ships a combined stylesheet and a self-registering CDN (IIFE) build.
- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d), [`4362f94`](https://github.com/amiralibg/Doran/commit/4362f945148e1618b4b432c1e52d04be94146587), [`015c983`](https://github.com/amiralibg/Doran/commit/015c9834c1d7235c88f8a6318dcfcbf64a79c08c)]:
  - @doranjs/core@0.0.2
  - @doranjs/nlp@0.0.2
  - @doranjs/holidays@0.0.2
