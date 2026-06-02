import { DoranDate } from '@doranjs/core';
import { defaultDayExtractors, defaultTimeExtractors } from './extractors';
import { hasFinglish, transliterateFinglish } from './finglish';
import { hasLatinLetters, remapKeyboard } from './keyboard';
import { normalize } from './normalize';
import type { DayExtractor, NlpContext, ParseOptions, ParseResult, TimeExtractor } from './types';

function combineConfidence(day?: number, time?: number): number {
  if (day !== undefined && time !== undefined) {
    return Math.min(0.99, (day + time) / 2 + 0.05);
  }
  return day ?? time ?? 0;
}

/**
 * An extensible Persian date parser. Register additional extractors with
 * {@link Parser.useDay} / {@link Parser.useTime} to teach it new expressions
 * without forking the defaults.
 *
 * @example
 * ```ts
 * const parser = new Parser();
 * parser.useDay((ctx) => (/تعطیلات/.test(ctx.text) ? myHolidayMatch(ctx) : null));
 * parser.parse('تعطیلات بعدی');
 * ```
 */
export class Parser {
  #dayExtractors: DayExtractor[];
  #timeExtractors: TimeExtractor[];

  constructor(options?: { dayExtractors?: DayExtractor[]; timeExtractors?: TimeExtractor[] }) {
    this.#dayExtractors = [...(options?.dayExtractors ?? defaultDayExtractors)];
    this.#timeExtractors = [...(options?.timeExtractors ?? defaultTimeExtractors)];
  }

  /** Registers a day extractor. Earlier-registered extractors take precedence. */
  useDay(extractor: DayExtractor): this {
    this.#dayExtractors.unshift(extractor);
    return this;
  }

  /** Registers a time extractor. Earlier-registered extractors take precedence. */
  useTime(extractor: TimeExtractor): this {
    this.#timeExtractors.unshift(extractor);
    return this;
  }

  /**
   * Parses a Persian date expression. Returns `null` when nothing is understood.
   *
   * Input is first tried as-is (normalized). If that yields nothing and the text
   * contains Latin letters, two rescue passes are attempted so that "near misses"
   * still resolve, in the spirit of search-expression matching:
   *
   * 1. **Keyboard remap** — text typed with the layout left in English
   *    (e.g. `tvnh` → «فردا»).
   * 2. **Finglish** — Latin-script Persian (e.g. `jomeh saat 7 shab` → «جمعه ساعت ۷ شب»).
   */
  parse(input: string, options?: ParseOptions): ParseResult | null {
    const reference = options?.reference ?? DoranDate.now(options);

    const direct = this.#run(normalize(input), reference);
    if (direct) return direct;

    if (hasLatinLetters(input)) {
      const finglish = hasFinglish(input)
        ? this.#run(normalize(transliterateFinglish(input)), reference)
        : null;
      if (finglish) return finglish;

      const remapped = this.#run(normalize(remapKeyboard(input)), reference);
      if (remapped) return remapped;
    }

    return null;
  }

  /** Runs the extractors against an already-normalized text. */
  #run(text: string, reference: DoranDate): ParseResult | null {
    const ctx: NlpContext = { reference, text, raw: text };

    let dayMatch = null;
    for (const extractor of this.#dayExtractors) {
      dayMatch = extractor(ctx);
      if (dayMatch) break;
    }

    let timeMatch = null;
    for (const extractor of this.#timeExtractors) {
      timeMatch = extractor(ctx);
      if (timeMatch) break;
    }

    if (!dayMatch && !timeMatch) return null;

    const baseDay = dayMatch ? dayMatch.date : reference.startOf('day');
    const date = timeMatch
      ? baseDay.addHours(timeMatch.hour).addMinutes(timeMatch.minute).addSeconds(timeMatch.second)
      : baseDay;

    const spans = [dayMatch?.span, timeMatch?.span].filter(Boolean) as string[];

    return {
      date,
      confidence: combineConfidence(dayMatch?.confidence, timeMatch?.confidence),
      matched: spans.join(' ').trim(),
    };
  }
}

/** A shared parser instance used by the module-level {@link parse} function. */
const defaultParser = new Parser();

/**
 * Parses a Persian natural-language date expression into a {@link DoranDate}.
 *
 * @example
 * ```ts
 * parse('فردا');
 * parse('جمعه ساعت ۷ شب');
 * parse('دو هفته دیگر', { reference: DoranDate.fromJalali(1405, 1, 1) });
 * ```
 */
export function parse(input: string, options?: ParseOptions): ParseResult | null {
  return defaultParser.parse(input, options);
}
