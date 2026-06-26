# @doranjs/core

موتور تاریخِ هجری شمسیِ تغییرناپذیر (immutable). بدون هیچ runtime dependency.

## `DoranDate`

### Factoryها و staticها

```ts
DoranDate.now(options?);
DoranDate.fromEpochMs(ms, options?);
DoranDate.fromGregorian(date: Date, options?);
DoranDate.fromJalali(year, month, day, options?);
DoranDate.fromJalali({ year, month, day, hour?, minute?, second?, millisecond? }, options?);

DoranDate.min(...dates); // زودترین
DoranDate.max(...dates); // دیرترین
DoranDate.isValid(year, month, day); // boolean
```

`options` برابر `{ timeZone?: string; locale?: string | Locale }` است.

### Accessorها

`year`، `month`، `day`، `hour`، `minute`، `second`، `millisecond`، `dayOfWeek`
(۰ = شنبه)، `quarter`، `dayOfYear`، `weekOfYear`، `daysInMonth`، `daysInYear`،
`timeZone`، `locale`، `epochMs`، `utcOffset` و `isLeapYear()`.

### محاسبات (immutable)

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

هفته از **شنبه** آغاز می‌شود (`startOf('week')`)، مطابق قرارداد تقویم فارسی.

### Setterها (immutable)

```ts
d.set('year', 1406); // هر یک از year|month|day|hour|minute|second|millisecond
d.with({ year: 1406, month: 1, day: 1 });
d.withYear(n);
d.withMonth(n);
d.withDay(n);
d.withHour(n);
d.withMinute(n);
d.withSecond(n);
d.withMillisecond(n);
```

روز به طول ماهِ حاصل clamp می‌شود.

### مقایسه

```ts
d.compare(other); // -1 | 0 | 1
d.isBefore(other); d.isAfter(other);
d.isSame(other, unit?); d.isSameOrBefore(other); d.isSameOrAfter(other);
d.isBetween(start, end, inclusivity?); // '[]' | '()' | '[)' | '(]'
d.isToday(); d.isTomorrow(); d.isYesterday();
d.diff(other, unit?, float?);
```

### زمان نسبی

```ts
d.fromNow(); // "۳ روز پیش"
d.from(other); // نسبت به یک تاریخ دیگر
d.toNow();
d.to(other);
d.fromNow(true); // مدت خام، بدون پسوند: "۳ روز"
```

عبارت‌ها از bundleِ `relativeTime` مربوط به locale می‌آیند (برای `fa-IR` و `en-US` فراهم شده است).

#### `durationToHuman` — humanizer مستقل مدت‌زمان

جایگزین `moment.duration(s, 'seconds').humanize()`:

```ts
import { durationToHuman } from '@doranjs/core';

durationToHuman(3600); // "یک ساعت"  (از locale پیش‌فرض جهانی استفاده می‌کند)
durationToHuman(3600, enUS); // "an hour"
durationToHuman(3600, 'en-US'); // "an hour"
durationToHuman(90 * 60, faIR); // "۲ ساعت"
```

### تبدیل و قالب‌بندی

```ts
d.toGregorian(); // Date نیتیو (لحظهٔ زیرین)
d.toDate(); // نام مستعار toGregorian()
d.toObject(); // فیلدهای جلالی: { year, month, day, hour, minute, second, millisecond }
d.toGregorianParts(); // فیلدهای میلادی در timezone این نمونه

// Serialization
d.toISOString(); // ISO-8601 میلادی UTC — "2026-05-31T10:09:05.000Z" (ایمن برای backend)
d.toGregorianISO(); // نام مستعار صریح toISOString()
d.toJalaliISO(); // ISO جلالی با offset محلی — "1405-03-11T13:39:05.000+03:30"
d.toJSON(); // مانند toISOString() — JSON.stringify پیش‌فرض ایمن است
d.valueOf(); // epoch milliseconds (برای < > و ریاضیات)
d.unix(); // epoch به ثانیه (پریتی با moment/dayjs)
d.toMillis(); // epoch milliseconds به‌عنوان method (پریتی با dayjs)

// قالب‌بندی
d.format(pattern); // فیلدهای جلالی، مثلاً "YYYY/MM/DD"
d.formatGregorian(pattern); // فیلدهای میلادی، همان مجموعهٔ token
d.withTimeZone(tz);
d.withLocale(locale);
d.clone();
```

#### `formatGregorian` — خروجی میلادی بدون کتابخانهٔ دوم

```ts
date.formatGregorian('YYYY-MM-DD'); // "2026-05-31"
date.formatGregorian('YYYY-MM-DD HH:mm:ss'); // "2026-05-31 10:09:05"
date.formatGregorian('DD MMM YYYY'); // "31 May 2026"
date.formatGregorian('dddd D MMMM YYYY'); // "Sunday 31 May 2026"
```

**همان مجموعهٔ token** که `format` دارد پشتیبانی می‌شود (جدول پایین). نام‌ها به انگلیسی و
ارقام لاتین (ASCII) رندر می‌شوند، پس خروجی برای ارسال به backend امن است.

#### ارسال تاریخ به backend

```ts
// ✅ toISOString() اکنون میلادی UTC است — می‌توانید مستقیم POST کنید
const payload = { createdAt: date.toISOString() };

// ✅ JSON.stringify هم ایمن است
const json = JSON.stringify({ date });

// ✅ نمایش جلالی به کاربر، ذخیرهٔ میلادی روی سرور
<span>{date.format('YYYY/MM/DD')}</span>
await api.post('/events', { date: date.toISOString() });

// ✅ round-trip بدون اتلاف
const restored = DoranDate.fromGregorian(new Date(date.toISOString()));
```

### Tokenهای format

| Token                   | خروجی                      |
| ----------------------- | -------------------------- |
| `YYYY` `YY`             | سال (۴ / ۲ رقمی)           |
| `MMMM` `MMM` `MM` `M`   | نام / شمارهٔ ماه           |
| `DD` `D`                | روز ماه                    |
| `dddd` `ddd` `dd` `d`   | نام / اندیس روز هفته       |
| `Q`                     | فصل (۱–۴)                  |
| `HH` `H` `hh` `h`       | ساعت (۲۴ / ۱۲)             |
| `mm` `m` `ss` `s` `SSS` | دقیقه / ثانیه / میلی‌ثانیه |
| `A` `a`                 | قبل/بعد از ظهر             |
| `Z` `ZZ`                | اختلاف از UTC              |

متن literal را داخل `[brackets]` بگذارید.

## Parse کردن

```ts
import { parseJalali } from '@doranjs/core';

parseJalali('1405/03/11');
parseJalali('۱۴۰۵-۰۳-۱۱ ۰۷:۳۰');
parseJalali('11 خرداد 1405', 'D MMMM YYYY'); // format صریح
```

## Primitiveهای تبدیل

```ts
gregorianToJalali(gy, gm, gd);
jalaliToGregorian(jy, jm, jd);
gregorianToJdn / jalaliToJdn / jdnToGregorian / jdnToJalali;
isLeapJalaliYear(jy);
jalaliMonthLength(jy, jm);
isValidJalaliDate(jy, jm, jd);
gregorianWeekday(gy, gm, gd); // ۰ = شنبه
```

## Localeها

```ts
import { faIR, enUS, registerLocale, setDefaultLocale } from '@doranjs/core';
```

## ابزارهای رقم

```ts
import { toPersianDigits, toLatinDigits, normalizeDigits } from '@doranjs/core';
```
