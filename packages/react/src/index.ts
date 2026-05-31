/**
 * `@doranjs/react` — RTL-first, accessible React components for the Persian calendar.
 *
 * Import the stylesheet once at your app root:
 * ```ts
 * import '@doranjs/react/styles.css';
 * ```
 *
 * @packageDocumentation
 */

// Headless core.
export {
  buildMonthGrid,
  type BuildMonthGridOptions,
  type CalendarDay,
  type MonthGrid,
} from './grid';
export {
  useCalendar,
  useDateRange,
  type DateRange,
  type UseCalendarOptions,
  type UseCalendarReturn,
  type UseDateRangeOptions,
  type UseDateRangeReturn,
  type YearMonth,
} from './hooks';

// Components.
export { DoranMonthView, type DoranMonthViewProps } from './month-view';
export { DoranCalendar, type DoranCalendarProps } from './calendar';
export { DoranDatePicker, type DoranDatePickerProps } from './date-picker';
export { DoranRangePicker, type DoranRangePickerProps } from './range-picker';
export { DoranAgenda, type AgendaEvent, type DoranAgendaProps } from './agenda';
