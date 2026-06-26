import type { DoranDateParts, Locale, Weekday } from './types';

function pad(value: number, length = 2): string {
  return String(Math.abs(value)).padStart(length, '0');
}

/**
 * Locale for rendering **Gregorian** fields: English names and Latin (ASCII)
 * digits, so the same token vocabulary as {@link formatParts} works for
 * {@link DoranDate.formatGregorian}. Weekday arrays are Saturday-first to match
 * the {@link Weekday} index convention (0 = Saturday).
 */
export const GREGORIAN_LOCALE: Locale = {
  name: 'en-gregorian',
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  weekdays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  weekdaysShort: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  weekdaysMin: ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'],
  meridiem: ['AM', 'PM'],
  formatNumber: (value) => value,
  parseNumber: (value) => value,
};

/** Context required to render a format pattern. */
export interface FormatContext extends DoranDateParts {
  weekday: Weekday;
  offsetMs: number;
}

export function formatOffset(offsetMs: number, withColon: boolean): string {
  const sign = offsetMs >= 0 ? '+' : '-';
  const totalMinutes = Math.round(Math.abs(offsetMs) / 60000);
  const hours = pad(Math.trunc(totalMinutes / 60));
  const minutes = pad(totalMinutes % 60);
  return `${sign}${hours}${withColon ? ':' : ''}${minutes}`;
}

/**
 * The supported format tokens, longest-first so the matcher is greedy. Inspired by
 * the familiar `dayjs` / `moment` token vocabulary.
 */
export const TOKEN =
  /\[([^\]]*)]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|d|Q|HH|H|hh|h|mm|m|ss|s|SSS|A|a|ZZ|Z/g;

/**
 * Renders Jalali date-time fields into a string using the given pattern.
 *
 * Supported tokens:
 *
 * | Token  | Output                       | Example       |
 * | ------ | ---------------------------- | ------------- |
 * | `YYYY` | 4-digit year                 | `1405`        |
 * | `YY`   | 2-digit year                 | `05`          |
 * | `MMMM` | Full month name              | `خرداد`       |
 * | `MMM`  | Short month name             | `خرد`         |
 * | `MM`   | 2-digit month                | `03`          |
 * | `M`    | Month                        | `3`           |
 * | `DD`   | 2-digit day                  | `11`          |
 * | `D`    | Day                          | `11`          |
 * | `dddd` | Full weekday name            | `یکشنبه`      |
 * | `ddd`  | Short weekday name           | `یک‌شنبه`     |
 * | `dd`   | Minimal weekday name         | `ی`           |
 * | `d`    | Weekday index (0 = Saturday) | `1`           |
 * | `Q`    | Quarter of the year          | `1`           |
 * | `HH`   | 2-digit 24h hour             | `07`          |
 * | `H`    | 24h hour                     | `7`           |
 * | `hh`   | 2-digit 12h hour             | `07`          |
 * | `h`    | 12h hour                     | `7`           |
 * | `mm`   | 2-digit minute               | `09`          |
 * | `m`    | Minute                       | `9`           |
 * | `ss`   | 2-digit second               | `05`          |
 * | `s`    | Second                       | `5`           |
 * | `SSS`  | Milliseconds                 | `040`         |
 * | `A`    | Meridiem                     | `بعد از ظهر`  |
 * | `Z`    | UTC offset                   | `+03:30`      |
 * | `ZZ`   | UTC offset, no colon         | `+0330`       |
 *
 * Wrap literal text in square brackets (e.g. `[ساعت] H`) to prevent substitution.
 */
export function formatParts(ctx: FormatContext, pattern: string, locale: Locale): string {
  const hour12 = ctx.hour % 12 === 0 ? 12 : ctx.hour % 12;
  const meridiem = ctx.hour < 12 ? locale.meridiem[0] : locale.meridiem[1];
  const num = locale.formatNumber;

  return pattern.replace(TOKEN, (match, literal: string | undefined) => {
    if (literal !== undefined) return literal;

    switch (match) {
      case 'YYYY':
        return num(pad(ctx.year, 4));
      case 'YY':
        return num(pad(ctx.year % 100));
      case 'MMMM':
        return locale.months[ctx.month - 1] ?? '';
      case 'MMM':
        return locale.monthsShort[ctx.month - 1] ?? '';
      case 'MM':
        return num(pad(ctx.month));
      case 'M':
        return num(String(ctx.month));
      case 'DD':
        return num(pad(ctx.day));
      case 'D':
        return num(String(ctx.day));
      case 'dddd':
        return locale.weekdays[ctx.weekday] ?? '';
      case 'ddd':
        return locale.weekdaysShort[ctx.weekday] ?? '';
      case 'dd':
        return locale.weekdaysMin[ctx.weekday] ?? '';
      case 'd':
        return num(String(ctx.weekday));
      case 'Q':
        return num(String(Math.floor((ctx.month - 1) / 3) + 1));
      case 'HH':
        return num(pad(ctx.hour));
      case 'H':
        return num(String(ctx.hour));
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
      case 'A':
      case 'a':
        return meridiem;
      case 'Z':
        return num(formatOffset(ctx.offsetMs, true));
      case 'ZZ':
        return num(formatOffset(ctx.offsetMs, false));
      default:
        return match;
    }
  });
}
