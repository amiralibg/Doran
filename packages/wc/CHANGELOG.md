# @doranjs/wc

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
