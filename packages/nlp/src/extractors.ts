import { DoranDate } from '@doran/core';
import {
  FUTURE_WORDS,
  MONTH_ANCHORS,
  PART_OF_DAY,
  PAST_WORDS,
  SPECIAL_DAYS,
  UNITS,
  type Unit,
} from './dictionary';
import { NUMBER_WORD_PATTERN, parsePersianNumber } from './numbers';
import type { DayExtractor, DayMatch, TimeExtractor, TimeMatch } from './types';

const FUTURE = FUTURE_WORDS.join('|');
const PAST = PAST_WORDS.join('|');

/** Weekday matchers, compound names first so `شنبه` does not shadow `یکشنبه`. */
const WEEKDAY_PATTERNS: Array<[RegExp, number]> = [
  [/پنج\s?شنبه/, 5],
  [/چهار\s?شنبه/, 4],
  [/سه\s?شنبه/, 3],
  [/دو\s?شنبه/, 2],
  [/یک\s?شنبه/, 1],
  [/جمعه/, 6],
  [/شنبه/, 0],
];

const PART_OF_DAY_PATTERNS: Array<[RegExp, keyof typeof PART_OF_DAY]> = [
  [/بعد\s?از\s?ظهر/, 'بعدازظهر'],
  [/نیمه\s?شب/, 'نیمهشب'],
  [/بامداد/, 'بامداد'],
  [/صبح/, 'صبح'],
  [/ظهر/, 'ظهر'],
  [/عصر/, 'عصر'],
  [/غروب/, 'غروب'],
  [/شب/, 'شب'],
];

function startOfDay(date: DoranDate): DoranDate {
  return date.startOf('day');
}

// ---------------------------------------------------------------------------
// Day extractors
// ---------------------------------------------------------------------------

/** `امروز`, `فردا`, `پس فردا`, `دیروز`, `پریروز`. */
export const relativeDayExtractor: DayExtractor = (ctx) => {
  const patterns: Array<[RegExp, number]> = [
    [/پس\s?فردا/, 2],
    [/پریروز|پریر/, -2],
    [/فردا/, 1],
    [/دیروز/, -1],
    [/امروز/, 0],
  ];
  for (const [pattern, offset] of patterns) {
    const m = ctx.text.match(pattern);
    if (m) {
      return { date: startOfDay(ctx.reference.addDays(offset)), confidence: 0.98, span: m[0] };
    }
  }
  return null;
};

/** Named days such as `نوروز`, optionally qualified by a year (`نوروز سال آینده`). */
export const specialDayExtractor: DayExtractor = (ctx) => {
  const namePatterns: Array<[RegExp, keyof typeof SPECIAL_DAYS]> = [
    [/چهار\s?شنبه\s?سوری/, 'چهارشنبهسوری'],
    [/سیزده\s?به\s?در/, 'سیزدهبهدر'],
    [/نوروز/, 'نوروز'],
    [/یلدا/, 'یلدا'],
  ];

  for (const [pattern, key] of namePatterns) {
    const m = ctx.text.match(pattern);
    if (!m) continue;
    const { month, day } = SPECIAL_DAYS[key]!;

    let yearDelta = 0;
    if (new RegExp(`سال\\s+(?:${FUTURE})|سال\\s+دیگر`).test(ctx.text)) yearDelta = 1;
    else if (new RegExp(`سال\\s+(?:${PAST})`).test(ctx.text)) yearDelta = -1;

    const date = DoranDate.fromJalali(
      { year: ctx.reference.year + yearDelta, month, day },
      refOptions(ctx.reference),
    );
    return { date, confidence: 0.95, span: m[0] };
  }
  return null;
};

/** `اول/وسط/آخر ماه [بعد|قبل]`. */
export const monthAnchorExtractor: DayExtractor = (ctx) => {
  const anchors = Object.keys(MONTH_ANCHORS).join('|');
  const pattern = new RegExp(`(${anchors})\\s+ماه(?:\\s+(${FUTURE}|${PAST}|این|جاری|همین))?`);
  const m = ctx.text.match(pattern);
  if (!m) return null;

  const anchor = MONTH_ANCHORS[m[1]!]!;
  const direction = m[2];
  let delta = 0;
  if (direction && new RegExp(`^(?:${FUTURE})$`).test(direction)) delta = 1;
  else if (direction && new RegExp(`^(?:${PAST})$`).test(direction)) delta = -1;

  const monthStart = ctx.reference.addMonths(delta).startOf('month');
  let date = monthStart;
  if (anchor === 'middle') date = monthStart.addDays(14);
  else if (anchor === 'last') date = monthStart.addDays(monthStart.daysInMonth - 1);

  return { date, confidence: 0.9, span: m[0] };
};

/** `N روز/هفته/ماه/سال دیگر|پیش` (and the bare `هفته بعد`, `سال آینده`, …). */
export const relativeUnitExtractor: DayExtractor = (ctx) => {
  const units = Object.keys(UNITS).join('|');
  const pattern = new RegExp(
    `(?:(${NUMBER_WORD_PATTERN}|\\d+)\\s+)?(${units})\\s+(${FUTURE}|${PAST})`,
  );
  const m = ctx.text.match(pattern);
  if (!m) return null;

  const amount = m[1] ? (parsePersianNumber(m[1]) ?? 1) : 1;
  const unit = UNITS[m[2]!] as Unit;
  const sign = new RegExp(`^(?:${PAST})$`).test(m[3]!) ? -1 : 1;

  const date = startOfDay(ctx.reference.add(sign * amount, unit));
  return { date, confidence: 0.92, span: m[0] };
};

/** Weekday names, optionally with `آینده`/`گذشته`. */
export const weekdayExtractor: DayExtractor = (ctx) => {
  for (const [pattern, weekday] of WEEKDAY_PATTERNS) {
    const m = ctx.text.match(pattern);
    if (!m) continue;

    const isNext = new RegExp(`(?:${FUTURE})`).test(ctx.text);
    const isPast = new RegExp(`(?:${PAST})`).test(ctx.text);
    const today = ctx.reference.dayOfWeek;

    let diff: number;
    if (isPast) {
      diff = -((today - weekday + 7) % 7 || 7);
    } else if (isNext) {
      diff = (weekday - today + 7) % 7 || 7;
    } else {
      diff = (weekday - today + 7) % 7; // upcoming, today inclusive
    }

    return {
      date: startOfDay(ctx.reference.addDays(diff)),
      confidence: isNext || isPast ? 0.95 : 0.9,
      span: m[0],
    };
  }
  return null;
};

// ---------------------------------------------------------------------------
// Time extractors
// ---------------------------------------------------------------------------

const PART_ALTERNATION = PART_OF_DAY_PATTERNS.map(([re]) => re.source).join('|');

function applyMeridiem(hour: number, part: keyof typeof PART_OF_DAY | undefined): number {
  if (!part) return hour;
  const meta = PART_OF_DAY[part]!;
  if (meta.pm === true && hour < 12) return hour + 12;
  if (meta.pm === false && hour === 12) return 0;
  if (part === 'نیمهشب' && hour === 12) return 0;
  return hour;
}

function matchPart(text: string): keyof typeof PART_OF_DAY | undefined {
  for (const [pattern, key] of PART_OF_DAY_PATTERNS) {
    if (pattern.test(text)) return key;
  }
  return undefined;
}

/** `ساعت ۷ شب`, `ساعت ۱۴:۳۰`, `۷ صبح`. */
export const explicitTimeExtractor: TimeExtractor = (ctx) => {
  const withKeyword = ctx.text.match(
    new RegExp(`ساعت\\s*(\\d{1,2})(?::(\\d{1,2}))?\\s*(${PART_ALTERNATION})?`),
  );
  const bare = withKeyword
    ? null
    : ctx.text.match(new RegExp(`(\\d{1,2})(?::(\\d{1,2}))?\\s*(${PART_ALTERNATION})`));

  const m = withKeyword ?? bare;
  if (!m) return null;

  const hourRaw = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  if (hourRaw > 23 || minute > 59) return null;

  const part = m[3] ? matchPart(m[3]) : undefined;
  const hour = applyMeridiem(hourRaw, part);

  return {
    hour,
    minute,
    second: 0,
    confidence: part ? 0.97 : 0.9,
    span: m[0],
  };
};

/** Bare part-of-day words (`صبح`, `شب`, …) with no explicit clock time. */
export const partOfDayExtractor: TimeExtractor = (ctx) => {
  for (const [pattern, key] of PART_OF_DAY_PATTERNS) {
    const m = ctx.text.match(pattern);
    if (m) {
      const meta = PART_OF_DAY[key]!;
      return { hour: meta.hour, minute: 0, second: 0, confidence: 0.85, span: m[0] };
    }
  }
  return null;
};

function refOptions(reference: DoranDate) {
  return { timeZone: reference.timeZone, locale: reference.locale };
}

/** The default day extractors, in priority order. */
export const defaultDayExtractors: DayExtractor[] = [
  specialDayExtractor,
  relativeDayExtractor,
  monthAnchorExtractor,
  relativeUnitExtractor,
  weekdayExtractor,
];

/** The default time extractors, in priority order. */
export const defaultTimeExtractors: TimeExtractor[] = [explicitTimeExtractor, partOfDayExtractor];

export type { DayMatch, TimeMatch };
