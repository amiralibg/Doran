import { DoranDate } from '@doranjs/core';
import {
  FUTURE_WORDS,
  MONTH_ANCHORS,
  MONTHS,
  PART_OF_DAY,
  PAST_WORDS,
  PRESENT_WORDS,
  SPECIAL_DAYS,
  TIME_FRACTIONS,
  UNITS,
  type Unit,
} from './dictionary';
import { NUMBER_PHRASE_PATTERN, NUMBER_WORD_PATTERN, parsePersianNumber } from './numbers';
import type { DayExtractor, DayMatch, TimeExtractor, TimeMatch } from './types';

const FUTURE = FUTURE_WORDS.join('|');
const PAST = PAST_WORDS.join('|');
const PRESENT = PRESENT_WORDS.join('|');

/** Month-name alternation, longest first so `امرداد` is tried before `مرداد`. */
const MONTH_ALT = Object.keys(MONTHS)
  .sort((a, b) => b.length - a.length)
  .join('|');

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
  [/نیمروز/, 'نیمروز'],
  [/بامداد/, 'بامداد'],
  [/سحرگاه|سحر/, 'سحر'],
  [/صبح/, 'صبح'],
  [/ظهر/, 'ظهر'],
  [/عصر/, 'عصر'],
  [/غروب/, 'غروب'],
  [/شامگاه/, 'شامگاه'],
  [/شب/, 'شب'],
];

function startOfDay(date: DoranDate): DoranDate {
  return date.startOf('day');
}

/**
 * Detects a relative *year* qualifier anywhere in the text (`سال بعد`, `۳ سال دیگه`,
 * `دو سال پیش`) and returns the signed year offset, or `0` if there is none. This lets an
 * explicit date that omits its own year inherit a `N سال بعد/پیش` qualifier — e.g.
 * «۳ سال دیگه ۱۱ دی» resolves to 11 Dey of `reference.year + 3`, not the current year.
 */
function relativeYearOffset(text: string): number {
  const m = text.match(
    new RegExp(`(?:(${NUMBER_PHRASE_PATTERN}|\\d+)\\s+)?سال\\s+(${FUTURE}|${PAST})`),
  );
  if (!m) return 0;
  const amount = m[1] ? (parsePersianNumber(m[1]) ?? 1) : 1;
  const sign = new RegExp(`^(?:${PAST})$`).test(m[2]!) ? -1 : 1;
  return sign * amount;
}

// ---------------------------------------------------------------------------
// Day extractors
// ---------------------------------------------------------------------------

/** `امروز`, `فردا`, `پس فردا`, `دیروز`, `پریروز`. */
export const relativeDayExtractor: DayExtractor = (ctx) => {
  const patterns: Array<[RegExp, number]> = [
    [/پس\s?فردا/, 2],
    [/پریروز|پریشب|پریر/, -2],
    [/فردا/, 1],
    [/دیروز|دیشب/, -1],
    [/امروز|امشب/, 0],
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

/** Resolves an anchor to a day offset inside a month given its length. */
function anchorDay(anchor: 'first' | 'middle' | 'last', daysInMonth: number): number {
  if (anchor === 'middle') return 14;
  if (anchor === 'last') return daysInMonth - 1;
  return 0;
}

/** `اول/وسط/آخر ماه [بعد|قبل]` and `اوایل/اواسط/اواخر <month-name>`. */
export const monthAnchorExtractor: DayExtractor = (ctx) => {
  const anchors = Object.keys(MONTH_ANCHORS).join('|');

  // `<anchor> <month-name> [<year>]` — e.g. «اواخر اسفند», «اوایل خرداد ۱۴۰۶».
  const named = ctx.text.match(
    new RegExp(`(${anchors})\\s+(${MONTH_ALT})(?:\\s+(\\d{3,4}))?(?=\\s|$)`),
  );
  if (named) {
    const anchor = MONTH_ANCHORS[named[1]!]!;
    const month = MONTHS[named[2]!]!;
    const year = named[3] ? Number(named[3]) : ctx.reference.year + relativeYearOffset(ctx.text);
    const monthStart = DoranDate.fromJalali({ year, month, day: 1 }, refOptions(ctx.reference));
    const date = monthStart.addDays(anchorDay(anchor, monthStart.daysInMonth));
    return { date, confidence: 0.9, span: named[0].trim() };
  }

  const pattern = new RegExp(`(${anchors})\\s+ماه(?:\\s+(${FUTURE}|${PAST}|این|جاری|همین))?`);
  const m = ctx.text.match(pattern);
  if (!m) return null;

  const anchor = MONTH_ANCHORS[m[1]!]!;
  const direction = m[2];
  let delta = 0;
  if (direction && new RegExp(`^(?:${FUTURE})$`).test(direction)) delta = 1;
  else if (direction && new RegExp(`^(?:${PAST})$`).test(direction)) delta = -1;

  const monthStart = ctx.reference.addMonths(delta).startOf('month');
  const date = monthStart.addDays(anchorDay(anchor, monthStart.daysInMonth));

  return { date, confidence: 0.9, span: m[0] };
};

/** `N روز/هفته/ماه/سال دیگر|پیش` (and the bare `هفته بعد`, `سال آینده`, …). */
export const relativeUnitExtractor: DayExtractor = (ctx) => {
  const units = Object.keys(UNITS).join('|');
  const pattern = new RegExp(
    `(?:(${NUMBER_PHRASE_PATTERN}|\\d+)\\s+)?(${units})(?:\\s*ی)?\\s+(${FUTURE}|${PAST})`,
  );
  const m = ctx.text.match(pattern);
  if (!m) return null;

  const amount = m[1] ? (parsePersianNumber(m[1]) ?? 1) : 1;
  const unit = UNITS[m[2]!] as Unit;
  const sign = new RegExp(`^(?:${PAST})$`).test(m[3]!) ? -1 : 1;

  const date = startOfDay(ctx.reference.add(sign * amount, unit));
  return { date, confidence: 0.92, span: m[0] };
};

/** Weekday names, optionally qualified by `آینده`/`گذشته` or `هفته بعد`/`هفته گذشته`. */
export const weekdayExtractor: DayExtractor = (ctx) => {
  for (const [pattern, weekday] of WEEKDAY_PATTERNS) {
    const m = ctx.text.match(pattern);
    if (!m) continue;

    // «<weekday> هفته بعد / هفته گذشته» — anchor to that weekday in the next/previous
    // week (Iranian weeks start Saturday), regardless of where it falls relative to today.
    const weekNext = new RegExp(`هفته(?:\\s*ی)?\\s+(?:${FUTURE})`).test(ctx.text);
    const weekPast = new RegExp(`هفته(?:\\s*ی)?\\s+(?:${PAST})`).test(ctx.text);
    if (weekNext || weekPast) {
      const weekStart = ctx.reference.startOf('week');
      const date = weekStart.addDays(weekday + (weekNext ? 7 : -7));
      return { date: startOfDay(date), confidence: 0.95, span: m[0] };
    }

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

/**
 * Explicit calendar dates: `۱۵ خرداد`, `۱۵ خرداد ۱۴۰۵`, `۱۵م خرداد`,
 * `پانزده خرداد`, a bare `خرداد ۱۴۰۵` (first of that month), and numeric forms
 * such as `۱۴۰۵/۰۳/۱۵` or `۱۴۰۵-۳-۱۵`.
 */
export const explicitDateExtractor: DayExtractor = (ctx) => {
  // Numeric: YYYY/MM/DD (also `-` separated).
  const numeric = ctx.text.match(/(\d{3,4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (numeric) {
    const year = Number(numeric[1]);
    const month = Number(numeric[2]);
    const day = Number(numeric[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return {
        date: DoranDate.fromJalali({ year, month, day }, refOptions(ctx.reference)),
        confidence: 0.99,
        span: numeric[0],
      };
    }
  }

  // `<day> <month-name> [<year>]` — day may be digits, a number word, or carry an
  // ordinal suffix (۱۵م / پانزدهم).
  const dayMonth = ctx.text.match(
    new RegExp(
      `(${NUMBER_PHRASE_PATTERN}|\\d{1,2})\\s*(?:م|ام|اُم)?\\s+(${MONTH_ALT})(?:\\s*ماه)?(?:\\s+(\\d{3,4}))?(?=\\s|$)`,
    ),
  );
  if (dayMonth) {
    const day = parsePersianNumber(dayMonth[1]!);
    const month = MONTHS[dayMonth[2]!]!;
    if (day !== null && day >= 1 && day <= 31) {
      const year = dayMonth[3]
        ? Number(dayMonth[3])
        : ctx.reference.year + relativeYearOffset(ctx.text);
      return {
        date: DoranDate.fromJalali({ year, month, day }, refOptions(ctx.reference)),
        confidence: dayMonth[3] ? 0.98 : 0.94,
        span: dayMonth[0].trim(),
      };
    }
  }

  // `<month-name> <year>` with no day → first of that month.
  const monthYear = ctx.text.match(new RegExp(`(${MONTH_ALT})(?:\\s*ماه)?\\s+(\\d{3,4})(?=\\s|$)`));
  if (monthYear) {
    const month = MONTHS[monthYear[1]!]!;
    const year = Number(monthYear[2]);
    return {
      date: DoranDate.fromJalali({ year, month, day: 1 }, refOptions(ctx.reference)),
      confidence: 0.9,
      span: monthYear[0].trim(),
    };
  }

  return null;
};

/** `این هفته`, `همین ماه`, `سال جاری` → the start of the current period. */
export const thisUnitExtractor: DayExtractor = (ctx) => {
  const units = Object.keys(UNITS).join('|');
  const pattern = new RegExp(
    `(?:(?:${PRESENT})\\s+(${units})|(${units})(?:\\s*ی)?\\s+(?:${PRESENT}))`,
  );
  const m = ctx.text.match(pattern);
  if (!m) return null;
  const unit = UNITS[(m[1] ?? m[2])!] as Unit;
  const map = { day: 'day', week: 'week', month: 'month', year: 'year' } as const;
  return { date: ctx.reference.startOf(map[unit]), confidence: 0.85, span: m[0] };
};

/** `آخر هفته` (weekend → upcoming Friday), `اول هفته` (→ Saturday). */
export const weekendExtractor: DayExtractor = (ctx) => {
  const anchors = Object.keys(MONTH_ANCHORS).join('|');
  const m = ctx.text.match(new RegExp(`(${anchors})\\s+هفته(?:\\s+(${FUTURE}|${PAST}))?`));
  if (!m) return null;
  const anchor = MONTH_ANCHORS[m[1]!]!;
  const direction = m[2];
  let weekDelta = 0;
  if (direction && new RegExp(`^(?:${FUTURE})$`).test(direction)) weekDelta = 1;
  else if (direction && new RegExp(`^(?:${PAST})$`).test(direction)) weekDelta = -1;

  const weekStart = ctx.reference.addWeeks(weekDelta).startOf('week'); // Saturday
  // first → Saturday, middle → Tuesday, last → Friday (the Iranian weekend).
  const offset = anchor === 'first' ? 0 : anchor === 'middle' ? 3 : 6;
  return { date: weekStart.addDays(offset), confidence: 0.88, span: m[0] };
};

// ---------------------------------------------------------------------------
// Time extractors
// ---------------------------------------------------------------------------

const PART_ALTERNATION = PART_OF_DAY_PATTERNS.map(([re]) => re.source).join('|');

function applyMeridiem(hour: number, part: keyof typeof PART_OF_DAY | undefined): number {
  if (!part) return hour;
  const meta = PART_OF_DAY[part]!;
  // "۱۲ شب"/"۱۲ نیمه‌شب" is midnight, not noon.
  if ((part === 'شب' || part === 'نیمهشب') && hour === 12) return 0;
  if (meta.pm === true && hour < 12) return hour + 12;
  if (meta.pm === false && hour === 12) return 0;
  return hour;
}

function matchPart(text: string): keyof typeof PART_OF_DAY | undefined {
  for (const [pattern, key] of PART_OF_DAY_PATTERNS) {
    if (pattern.test(text)) return key;
  }
  return undefined;
}

/** Fraction words (`ربع`→15, `نیم`→30, `سه ربع`→45), longest first. */
const FRACTION_ALT = Object.keys(TIME_FRACTIONS)
  .sort((a, b) => b.length - a.length)
  .join('|');

const HOUR = `${NUMBER_WORD_PATTERN}|\\d{1,2}`;
/** A "minutes" clause: a named fraction, or `<n> دقیقه`. */
const MINUTES_CLAUSE = `(?:${FRACTION_ALT}|(?:${NUMBER_WORD_PATTERN}|\\d{1,2})\\s*دقیقه)`;

/** Resolves a minutes clause (`نیم`, `ربع`, `سه ربع`, `۲۰ دقیقه`) to a minute count. */
function parseMinutesClause(text: string): number | null {
  const t = text.trim();
  if (t in TIME_FRACTIONS) return TIME_FRACTIONS[t]!;
  const min = t.match(new RegExp(`(${NUMBER_WORD_PATTERN}|\\d{1,2})\\s*دقیقه`));
  if (min) return parsePersianNumber(min[1]!);
  return null;
}

/**
 * Clock times: `ساعت ۷ شب`, `ساعت ۱۴:۳۰`, `۷ صبح`, `ساعت هفت و نیم`,
 * `ساعت ۸ و ربع`, `۸ و ۲۰ دقیقه`, and "to" forms like `یک ربع به ۸`,
 * `۲۰ دقیقه به ۸`.
 */
export const explicitTimeExtractor: TimeExtractor = (ctx) => {
  // "to" form: <minutes> به <hour> [part]  →  hour:(60 - minutes), hour -= 1.
  const toForm = ctx.text.match(
    new RegExp(`(?:یک\\s+)?(${MINUTES_CLAUSE})\\s+به\\s+(${HOUR})\\s*(${PART_ALTERNATION})?`),
  );
  if (toForm) {
    const frac = parseMinutesClause(toForm[1]!);
    const hourRaw = parsePersianNumber(toForm[2]!);
    if (frac !== null && frac <= 59 && hourRaw !== null && hourRaw <= 23) {
      const part = toForm[3] ? matchPart(toForm[3]) : undefined;
      const total = (applyMeridiem(hourRaw, part) * 60 - frac + 1440) % 1440;
      return {
        hour: Math.floor(total / 60),
        minute: total % 60,
        second: 0,
        confidence: 0.95,
        span: toForm[0],
      };
    }
  }

  const withKeyword = ctx.text.match(
    new RegExp(
      `ساعت\\s*(${HOUR})(?::(\\d{1,2}))?(?:\\s*و\\s*(${MINUTES_CLAUSE}))?\\s*(${PART_ALTERNATION})?`,
    ),
  );
  const bare = withKeyword
    ? null
    : ctx.text.match(
        new RegExp(
          `(${HOUR})(?::(\\d{1,2}))?(?:\\s*و\\s*(${MINUTES_CLAUSE}))?\\s*(${PART_ALTERNATION})`,
        ),
      );

  const m = withKeyword ?? bare;
  if (!m) return null;

  const hourRaw = parsePersianNumber(m[1]!);
  if (hourRaw === null || hourRaw > 23) return null;
  let minute = m[2] ? Number(m[2]) : 0;
  if (m[3]) {
    const frac = parseMinutesClause(m[3]);
    if (frac !== null) minute += frac;
  }
  if (minute > 59) return null;

  const part = m[4] ? matchPart(m[4]) : undefined;
  const hour = applyMeridiem(hourRaw, part);

  return {
    hour,
    minute,
    second: 0,
    confidence: part ? 0.97 : m[3] ? 0.95 : 0.9,
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
  // Anchored months (`اواخر اسفند`, `اول فروردین`) run before the explicit-date
  // extractor so its `<month> <year>` branch doesn't shadow `<anchor> <month> <year>`.
  monthAnchorExtractor,
  explicitDateExtractor,
  specialDayExtractor,
  relativeDayExtractor,
  // Before weekend/this-period/unit extractors so «جمعه هفته بعد» is read as a weekday
  // anchored to next week, not the bare «هفته بعد» unit shift.
  weekdayExtractor,
  weekendExtractor,
  thisUnitExtractor,
  relativeUnitExtractor,
];

/** The default time extractors, in priority order. */
export const defaultTimeExtractors: TimeExtractor[] = [explicitTimeExtractor, partOfDayExtractor];

export type { DayMatch, TimeMatch };
