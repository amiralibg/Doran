# @doranjs/core

The immutable Solar Hijri date engine. Zero runtime dependencies.

## `DoranDate`

### Factories & statics

```ts
DoranDate.now(options?);
DoranDate.fromEpochMs(ms, options?);
DoranDate.fromUnix(seconds, options?);
DoranDate.fromGregorian(date: Date, options?);
DoranDate.fromJalali(year, month, day, options?);
DoranDate.fromJalali({ year, month, day, hour?, minute?, second?, millisecond? }, options?);

DoranDate.min(...dates); // earliest
DoranDate.max(...dates); // latest
DoranDate.isValid(year, month, day); // boolean
```

`options` is `{ timeZone?: string; locale?: string | Locale }`.

### Accessors

`year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`, `dayOfWeek`
(0 = Saturday), `quarter`, `dayOfYear`, `week`, `weekYear`, `weekOfYear` (alias of
`week`), `weeksInYear`, `season` (1–4), `seasonName`, `daysInMonth`, `daysInYear`,
`timeZone`, `locale`, `epochMs`, `utcOffset`, and `isLeapYear()`.

Week numbering follows the Persian convention (Saturday-first, `doy: 12`) and matches
`moment-jalaali`'s `jWeek` / `jWeekYear`.

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
d.endOf(unit); // unit: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | ...
```

The week begins on **Saturday** (`startOf('week')`), per the Persian convention.

### Setters (immutable)

```ts
d.set('year', 1406); // any of year|month|day|hour|minute|second|millisecond
d.with({ year: 1406, month: 1, day: 1 });
d.withYear(n);
d.withMonth(n);
d.withDay(n);
d.withHour(n);
d.withMinute(n);
d.withSecond(n);
d.withMillisecond(n);
```

The day is clamped to the resulting month's length.

### Comparison

```ts
d.compare(other); // -1 | 0 | 1
d.isBefore(other); d.isAfter(other);
d.isSame(other, unit?); d.isSameOrBefore(other); d.isSameOrAfter(other);
d.isBetween(start, end, inclusivity?); // '[]' | '()' | '[)' | '(]'
d.isToday(); d.isTomorrow(); d.isYesterday();
d.diff(other, unit?, float?);
```

### Relative time

```ts
d.fromNow(); // "۳ روز پیش"
d.from(other); // relative to another date
d.toNow();
d.to(other);
d.fromNow(true); // bare duration, no suffix: "۳ روز"
d.diffDuration(other); // a signed Duration (see below)
```

Phrases come from the locale's `relativeTime` bundle (provided for `fa-IR`, `fa-AF`,
and `en-US`).

### Calendar time

```ts
d.calendar(); // "امروز ساعت ۱۴:۳۰" (relative to now)
d.calendar(reference); // relative to another date
d.calendar(reference, { sameDay: '[today]' }); // override templates
```

Produces phrases like _today / tomorrow / yesterday / last-week / a plain date_, driven
by the locale's `calendar` templates.

### Conversion & formatting

```ts
d.toGregorian(); // Date
d.toDate(); // alias of toGregorian
d.toObject(); // { year, month, day, hour, minute, second, millisecond }
d.toArray(); // [year, month, day, hour, minute, second, millisecond]
d.unix(); // Unix timestamp in seconds
d.toISOString();
d.toJSON();
d.valueOf();
d.withTimeZone(tz);
d.withLocale(locale);
d.clone();
d.format(pattern);
```

### Format tokens

| Token                            | Output                                   |
| -------------------------------- | ---------------------------------------- |
| `YYYY` `YY`                      | Year (4 / 2 digit)                       |
| `gggg` `gg`                      | Week-numbering year                      |
| `MMMM` `MMM` `MM` `Mo` `M`       | Month name / number / ordinal            |
| `DD` `Do` `D`                    | Day of month (+ ordinal)                 |
| `DDDD` `DDD`                     | Day of year                              |
| `dddd` `ddd` `dd` `d`            | Weekday name / index                     |
| `e` `E`                          | Locale (0 = Sat) / ISO (1 = Mon) weekday |
| `Qo` `Q`                         | Quarter (+ ordinal)                      |
| `wo` `ww` `w`                    | Week of year (+ ordinal)                 |
| `HH` `H` `kk` `k` `hh` `h`       | Hour (24 / 1–24 / 12)                    |
| `mm` `m` `ss` `s`                | Minute / second                          |
| `SSS` `SS` `S`                   | Fractional second                        |
| `A` `a`                          | Meridiem                                 |
| `X` `x`                          | Unix timestamp (seconds / ms)            |
| `Z` `ZZ`                         | UTC offset                               |
| `L` `LL` `LLL` `LLLL` `LT` `LTS` | Localized date/time (per locale)         |

Wrap literal text in `[brackets]`. The localized `L…`/`LT` tokens expand to
locale-specific patterns — e.g. `LLLL` → `"چهارشنبه ۱ فروردین ۱۴۰۳ ساعت ۱۴:۰۵"`.

## Duration

An immutable length of time with a Moment-compatible decomposition.

```ts
import { duration } from '@doranjs/core';

duration(1500); // 1.5 seconds (from milliseconds)
duration(2, 'hour'); // from a value + unit
duration({ months: 1, days: 10 }); // from fields

const d = duration({ hours: 2, minutes: 30 });
d.asMinutes(); // 150
d.as('hour'); // 2.5
d.get('minute'); // 30 (bubbled field)
d.toObject(); // { years, months, days, hours, minutes, seconds, milliseconds }
d.humanize(); // "۲ ساعت"
d.humanize(true); // "در ۲ ساعت"
d.toISOString(); // "PT2H30M"

a.diffDuration(b); // signed Duration between two dates
```

## Range

An immutable interval between two dates.

```ts
import { DoranRange } from '@doranjs/core';

const r = new DoranRange(a, b); // endpoints are normalized (start ≤ end)
r.contains(c, { excludeEnd: true });
r.overlaps(other, { adjacent: true });
r.intersect(other); // DoranRange | null
r.duration('day'); // length in a unit
r.asDuration(); // as a Duration
[...r.by('day')]; // iterate by a unit
[...r]; // default iterator steps by day
```

## Parsing

```ts
import { parseJalali } from '@doranjs/core';

parseJalali('1405/03/11');
parseJalali('۱۴۰۵-۰۳-۱۱ ۰۷:۳۰');
parseJalali('11 خرداد 1405', 'D MMMM YYYY'); // explicit format
parseJalali('1405-03-11', ['YYYY/MM/DD', 'YYYY-MM-DD']); // try several formats
```

Returns a `DoranDate`, or `null` if the input cannot be parsed.

`DoranDate.parse` is a convenience entry point that adds Gregorian ISO auto-detection:

```ts
DoranDate.parse('1405/03/11'); // Jalali (default formats)
DoranDate.parse('1405-03-11'); // a bare YYYY-MM-DD stays Jalali
DoranDate.parse('2024-03-20T08:30:00Z'); // a full ISO instant → Gregorian
DoranDate.parse('11 خرداد 1405', 'D MMMM YYYY'); // explicit formats → Jalali
```

With explicit `formats`, the input is always read as Jalali (delegating to `parseJalali`).
Without them, a full ISO-8601 instant (one carrying a time component) is parsed as
Gregorian; everything else — including a bare `YYYY-MM-DD` — is parsed as Jalali.

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
import { faIR, faAF, enUS, registerLocale, setDefaultLocale } from '@doranjs/core';
```

- `faIR` — Persian (Iran); the default.
- `faAF` — Dari (Afghanistan); the traditional zodiacal month names (حمل، ثور، …) over
  the same date arithmetic.
- `enUS` — transliterated English.

A `Locale` may also provide `longDateFormat`, `calendar`, `ordinal`, `seasons`, and
`week` for the corresponding features.

## Digit utilities

```ts
import { toPersianDigits, toLatinDigits, normalizeDigits } from '@doranjs/core';
```
