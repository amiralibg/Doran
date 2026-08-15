/**
 * `@doranjs/angular` — idiomatic Angular bindings for Doran.
 *
 * Standalone components are thin wrappers over the `@doranjs/wc` custom elements
 * (the shared engine), so the calendar/grid logic isn't reimplemented per
 * framework. They implement `ControlValueAccessor`, so they drop into reactive or
 * template-driven forms; `[(ngModel)]` / `formControl` carry a `DoranDate`, and
 * `(change)` also reports the Gregorian `Date` (the instant model).
 *
 * Import the styles once, e.g. in `styles.css`: `@import '@doranjs/wc/styles.css';`.
 *
 * @packageDocumentation
 */
export {
  DoranAgenda,
  DoranCalendar,
  DoranDatePicker,
  DoranNlpInput,
  DoranRangeDatePicker,
  DoranRangePicker,
  type DoranDateRange,
  type GregorianDateRange,
} from './components';
export { type FooterAction, type FooterActionsInput } from './attributes';
export { type CalendarGrid, createCalendarGrid } from './use-calendar-grid';
export { DORAN_DEFAULTS, type DoranDefaults, DoranProvider } from './provider';
