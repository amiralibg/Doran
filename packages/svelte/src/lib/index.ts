/**
 * `@doranjs/svelte` — idiomatic Svelte bindings for Doran.
 *
 * Components are thin `bind:value` wrappers over the `@doranjs/wc` custom
 * elements (the shared engine), so the calendar/grid logic isn't reimplemented
 * per framework. Change events follow the React convention: `bind:value` carries
 * a `DoranDate`, and `change` also reports the Gregorian `Date` (the instant model).
 *
 * Import the styles once: `import '@doranjs/wc/styles.css'`.
 *
 * @packageDocumentation
 */
export { default as DoranDatePicker } from './DoranDatePicker.svelte';
export { default as DoranCalendar } from './DoranCalendar.svelte';
export { default as DoranRangePicker } from './DoranRangePicker.svelte';
export { default as DoranRangeDatePicker } from './DoranRangeDatePicker.svelte';
export { default as DoranNlpInput } from './DoranNlpInput.svelte';
export { default as DoranAgenda } from './DoranAgenda.svelte';
export type { DoranDateRange, GregorianDateRange } from './DoranRangePicker.svelte';
export { createCalendarGrid, type CalendarGrid } from './use-calendar-grid';
export { default as DoranProvider } from './DoranProvider.svelte';
export { getDoranDefaults, setDoranDefaults, type DoranDefaults } from './provider';
