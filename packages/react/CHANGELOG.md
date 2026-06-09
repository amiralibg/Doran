# @doranjs/react

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
  - @doranjs/ui@0.0.4

## 0.0.6

### Patch Changes

- [#10](https://github.com/amiralibg/Doran/pull/10) [`3a2d815`](https://github.com/amiralibg/Doran/commit/3a2d815e160cc206d3210ccba97896a2dc043b8b) Thanks [@amiralibg](https://github.com/amiralibg)! - Promote `@doranjs/react`, `@doranjs/wc`, and `@doranjs/ui` to stable. Each now ships a
  full DOM-level test suite (rendering, interaction, keyboard a11y, and event contracts)
  under `jsdom`, covering the calendar, date picker, range picker, time picker,
  natural-language input, and agenda components/elements, the `useCalendar`/`useDateRange`
  hooks, and the `Button`/`ThemeProvider` primitives. No runtime behavior changes.
- Updated dependencies [[`3a2d815`](https://github.com/amiralibg/Doran/commit/3a2d815e160cc206d3210ccba97896a2dc043b8b)]:
  - @doranjs/ui@0.0.3

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

- [`0909f80`](https://github.com/amiralibg/Doran/commit/0909f80cbf5e17e1ac3b2c20f7a688e9414ab2c0) Thanks [@amiralibg](https://github.com/amiralibg)! - Polish the UI layer and make it deeply themeable:
  - `@doranjs/ui` — expanded design tokens (per-part colors, fonts, shadows, borders, and
    radii) plus an SVG icon set (`ChevronRightIcon`, `CalendarIcon`, …).
  - `@doranjs/react` — fixed the reversed RTL navigation arrows; polished day/selection/
    today/weekend/holiday colors and reworked the range band into a rounded pill. Added
    month/year/time selection (`headerMode`, `withTime`, `DoranTimePicker`), holiday and
    weekend highlighting, and a natural-language input (`DoranNlpInput` + `useNlpSuggest`).
    Every part is now overridable via component-level CSS variables.

- Updated dependencies [[`0909f80`](https://github.com/amiralibg/Doran/commit/0909f80cbf5e17e1ac3b2c20f7a688e9414ab2c0), [`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d), [`4362f94`](https://github.com/amiralibg/Doran/commit/4362f945148e1618b4b432c1e52d04be94146587)]:
  - @doranjs/ui@0.0.2
  - @doranjs/core@0.0.2
  - @doranjs/nlp@0.0.2

## 0.0.1

### Patch Changes

- [`0909f80`](https://github.com/amiralibg/Doran/commit/0909f80cbf5e17e1ac3b2c20f7a688e9414ab2c0) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of the UI layer:
  - `@doranjs/ui` — a minimal, RTL-first design system with CSS-variable design tokens
    (light/dark), a `ThemeProvider`/`useTheme`, a `Button`, and a `cn` helper.
  - `@doranjs/react` — accessible, RTL-first calendar components (`DoranCalendar`,
    `DoranMonthView`, `DoranDatePicker`, `DoranRangePicker`, `DoranAgenda`) plus the
    headless `useCalendar`, `useDateRange`, and `buildMonthGrid` primitives.

- Updated dependencies [[`0909f80`](https://github.com/amiralibg/Doran/commit/0909f80cbf5e17e1ac3b2c20f7a688e9414ab2c0), [`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d)]:
  - @doranjs/ui@0.0.1
  - @doranjs/core@0.0.1
