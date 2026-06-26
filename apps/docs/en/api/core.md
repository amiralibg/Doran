# @doranjs/core

The immutable Solar Hijri date engine. Zero runtime dependencies.

## `DoranDate`

### Factories & statics

```ts
DoranDate.now(options?);
DoranDate.fromEpochMs(ms, options?);
DoranDate.fromGregorian(date: Date, options?);
DoranDate.fromJalali(year, month, day, options?);
DoranDate.fromJalali({ year, month, day, hour?, minute?, second?, millisecond? }, options?);

// Non-throwing variants — return DoranDate | null instead of throwing
DoranDate.tryFromGregorian(date: Date, options?);
DoranDate.tryFromJalali(year, month, day, options?);

DoranDate.min(...dates); // earliest
DoranDate.max(...dates); // latest
DoranDate.isValid(year, month, day); // boolean
```

`options` is `{ timeZone?: string; locale?: string | Locale }`.

### Handling invalid dates

Doran never produces a silent `Invalid Date`. The policy is split by where the
input comes from:

- **Constructors throw** `RangeError` on invalid input — you control these fields,
  so a bad value is a bug worth surfacing immediately. `fromJalali` validates the
  calendar date and **never rolls over**: Esfand 31 in a non-leap year throws
  rather than becoming Farvardin 1.
- **`try*` constructors return `null`** when you'd rather branch than catch:
  `tryFromJalali`, `tryFromGregorian`.
- **`parseJalali` returns `null`** for unparseable or out-of-range strings — parsing
  untrusted text is expected to sometimes fail.

```ts
DoranDate.fromJalali(1404, 12, 31); // ❌ throws RangeError (1404 is not a leap year)
DoranDate.tryFromJalali(1404, 12, 31); // → null
DoranDate.fromGregorian(new Date('nope')); // ❌ throws RangeError
DoranDate.tryFromGregorian(new Date('nope')); // → null
parseJalali('not a date'); // → null

DoranDate.isValid(1404, 12, 31); // → false (check before constructing)
```

### Accessors

`year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`, `dayOfWeek`
(0 = Saturday), `quarter`, `dayOfYear`, `weekOfYear`, `daysInMonth`, `daysInYear`,
`timeZone`, `locale`, `epochMs`, `utcOffset`, and `isLeapYear()`.

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
```

Phrases come from the locale's `relativeTime` bundle (provided for `fa-IR` and `en-US`).

#### `durationToHuman` — standalone duration humanizer

Replaces `moment.duration(s, 'seconds').humanize()`:

```ts
import { durationToHuman } from '@doranjs/core';

durationToHuman(3600); // "یک ساعت"  (uses global default locale)
durationToHuman(3600, enUS); // "an hour"
durationToHuman(3600, 'en-US'); // "an hour"
durationToHuman(90 * 60, faIR); // "۲ ساعت"
```

### Conversion & formatting

```ts
d.toGregorian(); // native Date (the underlying instant)
d.toDate(); // alias of toGregorian()
d.toObject(); // Jalali fields: { year, month, day, hour, minute, second, millisecond }
d.toGregorianParts(); // Gregorian fields in this instance's time zone

// Serialization
d.toISOString(); // Gregorian UTC ISO-8601 — "2026-05-31T10:09:05.000Z" (safe for backends)
d.toGregorianISO(); // explicit alias of toISOString()
d.toJalaliISO(); // Jalali ISO with local offset — "1405-03-11T13:39:05.000+03:30"
d.toJSON(); // same as toISOString() — JSON.stringify is safe by default
d.valueOf(); // epoch milliseconds (enables < > arithmetic)
d.unix(); // epoch seconds  (moment/dayjs parity)
d.toMillis(); // epoch milliseconds as a method (dayjs parity)

// Formatting
d.format(pattern); // Jalali fields, e.g. "YYYY/MM/DD"
d.formatGregorian(pattern); // Gregorian fields, same token set
d.withTimeZone(tz);
d.withLocale(locale);
d.clone();
```

#### `formatGregorian` — Gregorian output without a second library

```ts
date.formatGregorian('YYYY-MM-DD'); // "2026-05-31"
date.formatGregorian('YYYY-MM-DD HH:mm:ss'); // "2026-05-31 10:09:05"
date.formatGregorian('DD MMM YYYY'); // "31 May 2026"
date.formatGregorian('dddd D MMMM YYYY'); // "Sunday 31 May 2026"
```

Supports the **same token set** as `format` (see below). Names render in English
and digits stay Latin (ASCII), so the output is safe to send to a backend.

#### Sending dates to your backend

```ts
// ✅ toISOString() is now Gregorian UTC — safe to POST directly
const payload = { createdAt: date.toISOString() };

// ✅ JSON.stringify is also safe
const json = JSON.stringify({ date });

// ✅ Display Jalali to the user, store Gregorian on the server
<span>{date.format('YYYY/MM/DD')}</span>
await api.post('/events', { date: date.toISOString() });

// ✅ Round-trips losslessly
const restored = DoranDate.fromGregorian(new Date(date.toISOString()));
```

### Format tokens

| Token                   | Output               |
| ----------------------- | -------------------- |
| `YYYY` `YY`             | Year (4 / 2 digit)   |
| `MMMM` `MMM` `MM` `M`   | Month name / number  |
| `DD` `D`                | Day of month         |
| `dddd` `ddd` `dd` `d`   | Weekday name / index |
| `Q`                     | Quarter (1–4)        |
| `HH` `H` `hh` `h`       | Hour (24 / 12)       |
| `mm` `m` `ss` `s` `SSS` | Minute / second / ms |
| `A` `a`                 | Meridiem             |
| `Z` `ZZ`                | UTC offset           |

Wrap literal text in `[brackets]`.

## Parsing

```ts
import { parseJalali } from '@doranjs/core';

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
import { faIR, enUS, registerLocale, setDefaultLocale } from '@doranjs/core';
```

## Digit utilities

```ts
import { toPersianDigits, toLatinDigits, normalizeDigits } from '@doranjs/core';
```
