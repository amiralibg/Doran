/**
 * `@doranjs/wc` — framework-agnostic Web Components for the Persian (Jalali) calendar.
 *
 * Importing this module **auto-registers** the custom elements, so in most apps you
 * just need:
 *
 * ```ts
 * import '@doranjs/wc';
 * import '@doranjs/wc/styles.css';
 * ```
 *
 * Then use `<doran-calendar>`, `<doran-datepicker>`, `<doran-rangepicker>`,
 * `<doran-nlp-input>`, and `<doran-agenda>` anywhere in your HTML. Call
 * {@link defineDoranElements} yourself if you import the element classes without the
 * side-effect.
 *
 * @packageDocumentation
 */

export { DoranCalendarElement } from './calendar-element';
export { DoranDatePickerElement } from './datepicker-element';
export { DoranRangePickerElement } from './rangepicker-element';
export { DoranNlpInputElement } from './nlp-input-element';
export { DoranAgendaElement, type AgendaEvent } from './agenda-element';
export { defaultRangePresets, type RangePreset } from './presets';
export { defineDoranElements, TAG_NAMES } from './register';
export { buildMonthGrid, navigateFocus, type GridDay, type GridNav, type MonthGrid } from './grid';

import { defineDoranElements } from './register';

// Side-effect: register on import in a browser environment.
defineDoranElements();
