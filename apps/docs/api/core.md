# @doran/core

The immutable Solar Hijri date engine. Zero runtime dependencies.

## `DoranDate`

### Factories

```ts
DoranDate.now(options?);
DoranDate.fromEpochMs(ms, options?);
DoranDate.fromGregorian(date: Date, options?);
DoranDate.fromJalali(year, month, day, options?);
DoranDate.fromJalali({ year, month, day, hour?, minute?, second?, millisecond? }, options?);
```

`options` is `{ timeZone?: string; locale?: string | Locale }`.

### Accessors

`year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`, `dayOfWeek`
(0 = Saturday), `quarter`, `dayOfYear`, `weekOfYear`, `daysInMonth`, `timeZone`,
`locale`, `epochMs`, `utcOffset`, and `isLeapYear()`.

### Arithmetic (immutable)

```ts
d.addMilliseconds(n);
d.addSeconds(n);
d.addMinutes(n);
d.addHours(n);
d.addDays(n);
d.addWeeks(n);
d.addMonths(n);
d.addYears(n);
d.add(n, unit);
d.subtract(n, unit);
d.startOf(unit);
d.endOf(unit); // unit: 'year' | 'month' | 'week' | 'day' | 'hour' | ...
```

### Comparison

```ts
d.compare(other); // -1 | 0 | 1
d.isBefore(other); d.isAfter(other);
d.isSame(other, unit?); d.isSameOrBefore(other); d.isSameOrAfter(other);
d.isBetween(start, end);
d.diff(other, unit?, float?);
```

### Conversion & formatting

```ts
d.toGregorian(); // Date
d.toObject(); // { year, month, day, hour, minute, second, millisecond }
d.toISOString();
d.toJSON();
d.valueOf();
d.withTimeZone(tz);
d.withLocale(locale);
d.clone();
d.format(pattern);
```

### Format tokens

| Token                   | Output               |
| ----------------------- | -------------------- |
| `YYYY` `YY`             | Year (4 / 2 digit)   |
| `MMMM` `MMM` `MM` `M`   | Month name / number  |
| `DD` `D`                | Day of month         |
| `dddd` `ddd` `dd` `d`   | Weekday name / index |
| `HH` `H` `hh` `h`       | Hour (24 / 12)       |
| `mm` `m` `ss` `s` `SSS` | Minute / second / ms |
| `A` `a`                 | Meridiem             |
| `Z` `ZZ`                | UTC offset           |

Wrap literal text in `[brackets]`.

## Parsing

```ts
import { parseJalali } from '@doran/core';

parseJalali('1405/03/11');
parseJalali('۱۴۰۵-۰۳-۱۱ ۰۷:۳۰');
parseJalali('11 خرداد 1405', 'D MMMM YYYY'); // explicit format
```

## Conversion primitives

```ts
gregorianToJalali(gy, gm, gd);
jalaliToGregorian(jy, jm, jd);
gregorianToJdn / jalaliToJdn / jdnToGregorian / jdnToJalali;
isLeapJalaliYear(jy);
jalaliMonthLength(jy, jm);
isValidJalaliDate(jy, jm, jd);
gregorianWeekday(gy, gm, gd); // 0 = Saturday
```

## Locales

```ts
import { faIR, enUS, registerLocale, setDefaultLocale } from '@doran/core';
```

## Digit utilities

```ts
import { toPersianDigits, toLatinDigits, normalizeDigits } from '@doran/core';
```
