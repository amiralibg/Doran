/**
 * `@doranjs/nlp` — Persian natural-language date parsing for the Solar Hijri calendar.
 *
 * @packageDocumentation
 */

export { Parser, parse } from './engine';
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
  NlpContext,
  ParseOptions,
  ParseResult,
  TimeExtractor,
  TimeMatch,
} from './types';
