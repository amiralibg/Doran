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
  navigateFocus,
  type BuildMonthGridOptions,
  type CalendarDay,
  type GridNav,
  type MonthGrid,
} from './grid';
export {
  useCalendar,
  useDateRange,
  type DateRange,
  type GregorianDateRange,
  type UseCalendarOptions,
  type UseCalendarReturn,
  type UseDateRangeOptions,
  type UseDateRangeReturn,
  type YearMonth,
} from './hooks';

// SSR-safe subtree defaults.
export {
  DoranProvider,
  useDoranContext,
  useResolvedLocale,
  type DoranDefaults,
  type DoranProviderProps,
} from './provider';

// Components.
export { DoranMonthView, type DoranMonthViewProps } from './month-view';
export { DoranCalendar, type DoranCalendarProps } from './calendar';
export { DoranDatePicker, type DoranDatePickerProps } from './date-picker';
export { DoranRangePicker, type DoranRangePickerProps } from './range-picker';
export { defaultRangePresets, type RangePreset } from './presets';
export { DoranAgenda, type AgendaEvent, type DoranAgendaProps } from './agenda';
export { DoranTimePicker, type DoranTimePickerProps, type TimeValue } from './time-picker';
export {
  DoranNlpInput,
  useNlpSuggest,
  type DoranNlpInputProps,
  type NlpSuggestState,
} from './nlp-input';
export {
  CalendarHeader,
  MonthYearPanel,
  type CalendarArrows,
  type CalendarHeaderProps,
  type CalendarPanel,
  type HeaderMode,
  type MonthYearPanelProps,
} from './calendar-header';
