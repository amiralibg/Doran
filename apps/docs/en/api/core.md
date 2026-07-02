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
DoranDate.fromGregorianParts({ year, month, day, hour?, ... }, options?); // Gregorian civil fields in tz
DoranDate.fromTemporal(instant | zonedDateTime | plainDateTime, options?); // TC39 Temporal bridge

// Non-throwing variants — return DoranDate | null instead of throwing
DoranDate.tryFromGregorian(date: Date, options?);
DoranDate.tryFromGregorianParts({ year, month, day, ... }, options?);
DoranDate.tryFromJalali(year, month, day, options?);

DoranDate.min(...dates); // earliest
DoranDate.max(...dates); // latest
DoranDate.isValid(year, month, day); // boolean

// Freezable clock for deterministic tests (no global Date monkey-patching)
DoranDate.setNow(source); // number | Date | DoranDate | (() => those)
DoranDate.resetNow();
freeze(instant, fn); // standalone helper — freezes now() inside fn, then restores
```

`options` is `{ timeZone?: string; locale?: string | Locale }`. See
[Testing with Doran](/en/guide/testing) for the freezable-clock recipe.

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

#### `Duration` — immutable duration type

A small immutable duration for arithmetic, comparison, and unit conversion
(moment.duration / luxon Duration parity). Tree-shakeable — import only where used.

```ts
import { Duration } from '@doranjs/core';

const d = new Duration({ hours: 1, minutes: 30 });
d.as('minute'); // 90
d.as('hour'); // 1.5
d.add({ minutes: 30 }).as('hour'); // 2
d.subtract({ minutes: 30 }).as('hour'); // 1
d.humanize(); // "an hour" / "یک ساعت" (magnitude, no suffix)

Duration.fromMillis(90 * 60_000).toObject(); // { hours: 1, minutes: 30, ... }
new Duration({ hours: 2 }) > new Duration({ hours: 1 }); // true (valueOf = total ms)
```

`as` / `toMillis` use fixed averages for the variable-length units — a month is
30 days and a year is 365 days, matching moment/luxon for un-anchored durations.
For exact calendar deltas (real month/year lengths), use `DoranDate` arithmetic
and `diff` instead.

`diff` can return a `Duration` broken into fields:

```ts
b.diff(a, 'duration'); // Duration { days: 2, hours: 3, minutes: 30, ... }
b.diff(a, 'day'); // 2  (number, as before)
```

### Conversion & formatting

```ts
d.toGregorian(); // native Date (the underlying instant)
d.toDate(); // alias of toGregorian()
d.toTemporal(); // Temporal.ZonedDateTime (requires a Temporal runtime)
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
d.format(pattern, { digits: 'latin' | 'persian' }); // per-call digit override
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

Wrap literal text in `[brackets]`. Pass `{ digits: 'latin' | 'persian' }` as a
second argument to `format` to override digit style for one call without swapping
the locale — see [Locales & digits](/en/guide/locales).

## Parsing

Strict and lenient parsing for **both** calendars, with the same token set as
`format`. Persian/Arabic digits are normalized first. Invalid input returns
`null` (never `Invalid Date`).

```ts
import { parse, parseJalali, parseGregorian } from '@doranjs/core';

// Jalali
parseJalali('1405/03/11');
parseJalali('۱۴۰۵-۰۳-۱۱ ۰۷:۳۰');
parseJalali('11 خرداد 1405', 'D MMMM YYYY'); // explicit format

// Gregorian — consistent across engines, unlike new Date(string)
parseGregorian('2026-05-31');
parseGregorian('2026-05-31 10:09:05');
parseGregorian('31 May 2026', 'D MMMM YYYY');

// Unified, with explicit calendar selection (defaults to Jalali)
parse('1405/03/11');
parse('2026-05-31', undefined, { calendar: 'gregorian' });
```

### Strict mode

Pass `{ strict: true }` to require an exact token-width match and skip the
fallback default-format sweep. Use it to reject partial or loosely-shaped input.

```ts
parseGregorian('2026-5-31', 'YYYY-MM-DD'); // → DoranDate (lenient: 1–2 digits)
parseGregorian('2026-5-31', 'YYYY-MM-DD', { strict: true }); // → null (MM needs 2 digits)
parseJalali('1405/3/1', 'YYYY/MM/DD', { strict: true }); // → null
```

`options` is `{ timeZone?, locale?, strict? }`; `parse` also accepts
`calendar?: 'jalali' | 'gregorian'`. Fields are interpreted as wall-clock time
in `timeZone`.

## Conversion primitives

```ts
gregorianToJalali(gy, gm, gd);
jalaliToGregorian(jy, jm, jd);
gregorianToJdn / jalaliToJdn / jdnToGregorian / jdnToJalali;
isLeapJalaliYear(jy);
jalaliMonthLength(jy, jm);
isValidJalaliDate(jy, jm, jd);
isLeapGregorianYear(gy);
gregorianMonthLength(gy, gm);
isValidGregorianDate(gy, gm, gd);
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

## Doran and TC39 Temporal

[TC39 Temporal](https://tc39.es/proposal-temporal/) is the platform's coming
date-time API. Doran already shares its core model — an **immutable** value over
a single **instant + time zone** — so the two interoperate cleanly. The pitch:
_Temporal-shaped, with first-class Jalali today._

Bridge in both directions. The methods are **structural** (duck-typed) and behind
a feature detect, so there is **no hard dependency** on `Temporal`:

```ts
// From Temporal → Doran (works even without a Temporal runtime)
DoranDate.fromTemporal(zdt); // Temporal.ZonedDateTime  → adopts its instant + zone
DoranDate.fromTemporal(instant, { timeZone: 'Asia/Tehran' });
DoranDate.fromTemporal(plainDateTime, { timeZone: 'UTC' }); // wall-clock in the zone

// From Doran → Temporal (needs Temporal in the runtime, else throws)
date.toTemporal(); // Temporal.ZonedDateTime (ISO calendar) at the same instant
```

`toTemporal()` returns a `ZonedDateTime` in the ISO (Gregorian) calendar for the
same instant — the Jalali fields are a Doran-side rendering. Until Temporal ships
in your runtime, keep using `toISOString()` / `fromGregorian` for interchange.
