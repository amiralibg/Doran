import { DEFAULT_LONG_DATE_FORMAT } from './locale';
import type { DoranDateParts, Locale, LongDateFormat, Weekday } from './types';

function pad(value: number, length = 2): string {
  return String(Math.abs(value)).padStart(length, '0');
}

/**
 * Context required to render a format pattern. The fields beyond {@link DoranDateParts}
 * are optional: {@link DoranDate.format} always supplies them, but low-level callers may
 * omit the ones they do not need (the dependent tokens then fall back to `0`).
 */
export interface FormatContext extends DoranDateParts {
  weekday: Weekday;
  offsetMs: number;
  /** Epoch milliseconds — required for the `X` / `x` tokens. */
  epochMs?: number;
  /** 1-based day of the Jalali year — required for `DDD` / `DDDD`. */
  dayOfYear?: number;
  /** Week of year — required for `w` / `ww` / `wo` / `W` / `WW` / `Wo`. */
  week?: number;
  /** Week-numbering year — required for `gg` / `gggg`. */
  weekYear?: number;
}

function formatOffset(offsetMs: number, withColon: boolean): string {
  const sign = offsetMs >= 0 ? '+' : '-';
  const totalMinutes = Math.round(Math.abs(offsetMs) / 60000);
  const hours = pad(Math.trunc(totalMinutes / 60));
  const minutes = pad(totalMinutes % 60);
  return `${sign}${hours}${withColon ? ':' : ''}${minutes}`;
}

/** Matches a `[literal]` or any localized token, longest-first. */
const LOCALIZED_TOKEN = /\[[^\]]*]|(LTS|LLLL|LLL|LL|LT|L)/g;

/**
 * Expands the localized `L`/`LL`/`LLL`/`LLLL`/`LT`/`LTS` tokens into their underlying
 * patterns (e.g. `LLL` → `D MMMM YYYY [ساعت] HH:mm`). Runs repeatedly because the longer
 * templates embed `LT`. Text inside `[...]` literals is left untouched.
 */
function expandLocalized(pattern: string, ldf: LongDateFormat): string {
  let output = pattern;
  let previous: string;
  let guard = 0;
  do {
    previous = output;
    output = output.replace(LOCALIZED_TOKEN, (literal, token: string | undefined) =>
      token ? ldf[token as keyof LongDateFormat] : literal,
    );
    guard += 1;
  } while (output !== previous && guard < 10);
  return output;
}

/**
 * The supported format tokens, longest-first so the matcher is greedy. Inspired by
 * the familiar `dayjs` / `moment` token vocabulary.
 */
const TOKEN =
  /\[([^\]]*)]|YYYY|YY|gggg|gg|MMMM|MMM|MM|Mo|M|DDDD|DDD|DD|Do|D|dddd|ddd|dd|d|E|e|Qo|Q|wo|ww|w|Wo|WW|W|HH|H|kk|k|hh|h|mm|m|ss|s|SSS|SS|S|A|a|X|x|ZZ|Z/g;

/**
 * Renders Jalali date-time fields into a string using the given pattern.
 *
 * Supported tokens:
 *
 * | Token  | Output                       | Example       |
 * | ------ | ---------------------------- | ------------- |
 * | `YYYY` | 4-digit year                 | `1405`        |
 * | `YY`   | 2-digit year                 | `05`          |
 * | `gggg` | Week-numbering year          | `1405`        |
 * | `gg`   | 2-digit week-numbering year  | `05`          |
 * | `MMMM` | Full month name              | `خرداد`       |
 * | `MMM`  | Short month name             | `خرد`         |
 * | `MM`   | 2-digit month                | `03`          |
 * | `Mo`   | Ordinal month                | `3rd` / `۳م`  |
 * | `M`    | Month                        | `3`           |
 * | `DDDD` | 3-digit day of year          | `072`         |
 * | `DDD`  | Day of year                  | `72`          |
 * | `DD`   | 2-digit day                  | `11`          |
 * | `Do`   | Ordinal day                  | `11th` / `۱۱م`|
 * | `D`    | Day                          | `11`          |
 * | `dddd` | Full weekday name            | `یکشنبه`      |
 * | `ddd`  | Short weekday name           | `یک‌شنبه`     |
 * | `dd`   | Minimal weekday name         | `ی`           |
 * | `d`    | Weekday index (0 = Saturday) | `1`           |
 * | `e`    | Locale weekday (0 = Saturday)| `1`           |
 * | `E`    | ISO weekday (1 = Monday)     | `7`           |
 * | `Qo`   | Ordinal quarter              | `1st` / `۱م`  |
 * | `Q`    | Quarter of the year          | `1`           |
 * | `wo`   | Ordinal week of year         | `1st` / `۱م`  |
 * | `ww`   | 2-digit week of year         | `01`          |
 * | `w`    | Week of year                 | `1`           |
 * | `HH`   | 2-digit 24h hour             | `07`          |
 * | `H`    | 24h hour                     | `7`           |
 * | `kk`   | 2-digit 1–24 hour            | `07`          |
 * | `k`    | 1–24 hour (midnight = 24)    | `24`          |
 * | `hh`   | 2-digit 12h hour             | `07`          |
 * | `h`    | 12h hour                     | `7`           |
 * | `mm`   | 2-digit minute               | `09`          |
 * | `m`    | Minute                       | `9`           |
 * | `ss`   | 2-digit second               | `05`          |
 * | `s`    | Second                       | `5`           |
 * | `SSS`  | Milliseconds                 | `040`         |
 * | `SS`   | Centiseconds                 | `04`          |
 * | `S`    | Deciseconds                  | `0`           |
 * | `A`    | Meridiem                     | `بعد از ظهر`  |
 * | `X`    | Unix timestamp (seconds)     | `1742500000`  |
 * | `x`    | Unix timestamp (ms)          | `1742500000000` |
 * | `Z`    | UTC offset                   | `+03:30`      |
 * | `ZZ`   | UTC offset, no colon         | `+0330`       |
 *
 * The localized tokens `L` `LL` `LLL` `LLLL` `LT` `LTS` expand to locale-specific
 * patterns before rendering. Wrap literal text in square brackets (e.g. `[ساعت] H`) to
 * prevent substitution.
 */
export function formatParts(ctx: FormatContext, pattern: string, locale: Locale): string {
  const hour12 = ctx.hour % 12 === 0 ? 12 : ctx.hour % 12;
  const hour24 = ctx.hour === 0 ? 24 : ctx.hour;
  const meridiem = ctx.hour < 12 ? locale.meridiem[0] : locale.meridiem[1];
  const num = locale.formatNumber;
  const ordinal = locale.ordinal ?? ((value: number): string => num(String(value)));
  const quarter = Math.floor((ctx.month - 1) / 3) + 1;
  const isoWeekday = ((ctx.weekday + 5) % 7) + 1;
  const week = ctx.week ?? 0;
  const epochMs = ctx.epochMs ?? 0;
  const expanded = expandLocalized(pattern, locale.longDateFormat ?? DEFAULT_LONG_DATE_FORMAT);

  return expanded.replace(TOKEN, (match, literal: string | undefined) => {
    if (literal !== undefined) return literal;

    switch (match) {
      case 'YYYY':
        return num(pad(ctx.year, 4));
      case 'YY':
        return num(pad(ctx.year % 100));
      case 'gggg':
        return num(pad(ctx.weekYear ?? ctx.year, 4));
      case 'gg':
        return num(pad((ctx.weekYear ?? ctx.year) % 100));
      case 'MMMM':
        return locale.months[ctx.month - 1] ?? '';
      case 'MMM':
        return locale.monthsShort[ctx.month - 1] ?? '';
      case 'MM':
        return num(pad(ctx.month));
      case 'Mo':
        return ordinal(ctx.month);
      case 'M':
        return num(String(ctx.month));
      case 'DDDD':
        return num(pad(ctx.dayOfYear ?? 0, 3));
      case 'DDD':
        return num(String(ctx.dayOfYear ?? 0));
      case 'DD':
        return num(pad(ctx.day));
      case 'Do':
        return ordinal(ctx.day);
      case 'D':
        return num(String(ctx.day));
      case 'dddd':
        return locale.weekdays[ctx.weekday] ?? '';
      case 'ddd':
        return locale.weekdaysShort[ctx.weekday] ?? '';
      case 'dd':
        return locale.weekdaysMin[ctx.weekday] ?? '';
      case 'd':
      case 'e':
        return num(String(ctx.weekday));
      case 'E':
        return num(String(isoWeekday));
      case 'Qo':
        return ordinal(quarter);
      case 'Q':
        return num(String(quarter));
      case 'wo':
      case 'Wo':
        return ordinal(week);
      case 'ww':
      case 'WW':
        return num(pad(week));
      case 'w':
      case 'W':
        return num(String(week));
      case 'HH':
        return num(pad(ctx.hour));
      case 'H':
        return num(String(ctx.hour));
      case 'kk':
        return num(pad(hour24));
      case 'k':
        return num(String(hour24));
      case 'hh':
        return num(pad(hour12));
      case 'h':
        return num(String(hour12));
      case 'mm':
        return num(pad(ctx.minute));
      case 'm':
        return num(String(ctx.minute));
      case 'ss':
        return num(pad(ctx.second));
      case 's':
        return num(String(ctx.second));
      case 'SSS':
        return num(pad(ctx.millisecond, 3));
      case 'SS':
        return num(pad(Math.floor(ctx.millisecond / 10)));
      case 'S':
        return num(String(Math.floor(ctx.millisecond / 100)));
      case 'A':
      case 'a':
        return meridiem;
      case 'X':
        return num(String(Math.floor(epochMs / 1000)));
      case 'x':
        return num(String(epochMs));
      case 'Z':
        return num(formatOffset(ctx.offsetMs, true));
      case 'ZZ':
        return num(formatOffset(ctx.offsetMs, false));
      default:
        return match;
    }
  });
}
