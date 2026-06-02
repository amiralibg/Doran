---
'@doranjs/react': patch
'@doranjs/wc': patch
---

Accessibility: full WAI-ARIA keyboard navigation for the calendar grid.

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
