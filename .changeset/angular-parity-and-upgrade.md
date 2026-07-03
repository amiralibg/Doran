---
'@doranjs/angular': minor
---

Make the Angular components work client-side and reach feature parity with the
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
