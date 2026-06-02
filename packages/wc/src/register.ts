import { DoranCalendarElement } from './calendar-element';
import { DoranDatePickerElement } from './datepicker-element';
import { DoranNlpInputElement } from './nlp-input-element';
import { DoranRangePickerElement } from './rangepicker-element';

/** The custom-element tag names Doran registers. */
export const TAG_NAMES = {
  calendar: 'doran-calendar',
  datepicker: 'doran-datepicker',
  rangepicker: 'doran-rangepicker',
  nlpInput: 'doran-nlp-input',
} as const;

/**
 * Defines all Doran custom elements (idempotent — safe to call more than once and
 * skips tags another bundle already registered).
 */
export function defineDoranElements(): void {
  if (typeof customElements === 'undefined') return;
  const define = (tag: string, ctor: CustomElementConstructor) => {
    if (!customElements.get(tag)) customElements.define(tag, ctor);
  };
  define(TAG_NAMES.calendar, DoranCalendarElement);
  define(TAG_NAMES.datepicker, DoranDatePickerElement);
  define(TAG_NAMES.rangepicker, DoranRangePickerElement);
  define(TAG_NAMES.nlpInput, DoranNlpInputElement);
}
