/**
 * `@doranjs/nlp` — Persian natural-language date parsing for the Solar Hijri calendar.
 *
 * @packageDocumentation
 */

export { Parser, parse } from './engine';
export { parseRange } from './range';
export { parseDuration } from './duration';
export { parseRecurrence, occurrences } from './recurrence';
export { normalize } from './normalize';
export { remapKeyboard } from './keyboard';
export { registerFinglish, transliterateFinglish } from './finglish';
export { parsePersianNumber } from './numbers';
export { suggest, type Suggestion, type SuggestOptions } from './suggest';

export {
  defaultDayExtractors,
  defaultTimeExtractors,
  explicitDateExtractor,
  explicitTimeExtractor,
  monthAnchorExtractor,
  partOfDayExtractor,
  relativeDayExtractor,
  relativeUnitExtractor,
  specialDayExtractor,
  thisUnitExtractor,
  weekdayExtractor,
  weekendExtractor,
} from './extractors';

export type {
  DayExtractor,
  DayMatch,
  DurationResult,
  DurationUnit,
  NlpContext,
  ParseOptions,
  ParseResult,
  RangeResult,
  RecurrenceFreq,
  RecurrenceResult,
  TimeExtractor,
  TimeMatch,
} from './types';
