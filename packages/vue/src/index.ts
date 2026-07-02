/**
 * `@doranjs/vue` — idiomatic Vue 3 bindings for Doran.
 *
 * Components are thin `v-model` wrappers over the `@doranjs/wc` custom elements
 * (the shared engine), so the calendar/grid logic isn't reimplemented per
 * framework. Change events follow the React convention: `v-model` carries a
 * `DoranDate`, and `change` also emits the Gregorian `Date` (the instant model).
 *
 * Import the styles once: `import '@doranjs/vue/styles.css'`.
 *
 * @packageDocumentation
 */
export {
  DoranAgenda,
  DoranCalendar,
  DoranDatePicker,
  DoranNlpInput,
  DoranRangePicker,
  type DoranDateRange,
  type GregorianDateRange,
} from './components';
export { useCalendarGrid, type UseCalendarGrid } from './use-calendar-grid';
export { DoranProvider, injectDoranDefaults, type DoranDefaults } from './provider';
