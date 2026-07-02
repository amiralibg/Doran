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
DoranDate.fromGregorianParts({ year, month, day, hour?, ... }, options?); // فیلدهای میلادی در timezone
DoranDate.fromTemporal(instant | zonedDateTime | plainDateTime, options?); // پل TC39 Temporal

// نسخه‌های بدون throw — به‌جای throw مقدار DoranDate | null برمی‌گردانند
DoranDate.tryFromGregorian(date: Date, options?);
DoranDate.tryFromGregorianParts({ year, month, day, ... }, options?);
DoranDate.tryFromJalali(year, month, day, options?);

DoranDate.min(...dates); // زودترین
DoranDate.max(...dates); // دیرترین
DoranDate.isValid(year, month, day); // boolean

// کلاک قابل‌فریز برای تست‌های قطعی (بدون دستکاری Date سراسری)
DoranDate.setNow(source); // number | Date | DoranDate | (() => اینها)
DoranDate.resetNow();
freeze(instant, fn); // هِلپر مستقل — درون fn مقدار now() را فریز و سپس بازمی‌گرداند
```

`options` برابر `{ timeZone?: string; locale?: string | Locale }` است. برای دستور کلاک
قابل‌فریز [تست با دوران](/guide/testing) را ببینید.

### مدیریت تاریخ‌های نامعتبر

دوران هرگز `Invalid Date` خاموش تولید نمی‌کند. سیاست بر اساس منشأ ورودی تقسیم می‌شود:

- **سازنده‌ها (constructors) `RangeError` پرتاب می‌کنند** روی ورودی نامعتبر — این فیلدها را شما
  کنترل می‌کنید، پس مقدار بد یک باگ است که باید فوراً دیده شود. `fromJalali` تاریخ تقویمی را
  اعتبارسنجی می‌کند و **هرگز سرریز نمی‌شود**: ۳۱ اسفند در سال غیرکبیسه throw می‌کند، نه اینکه به
  ۱ فروردین تبدیل شود.
- **سازنده‌های `try*` مقدار `null` برمی‌گردانند** وقتی می‌خواهید به‌جای catch شاخه بزنید:
  `tryFromJalali`، `tryFromGregorian`.
- **`parseJalali` مقدار `null` برمی‌گرداند** برای رشته‌های غیرقابل‌تجزیه یا خارج از بازه — تجزیهٔ
  متن نامطمئن طبیعتاً گاهی شکست می‌خورد.

```ts
DoranDate.fromJalali(1404, 12, 31); // ❌ RangeError پرتاب می‌کند (۱۴۰۴ کبیسه نیست)
DoranDate.tryFromJalali(1404, 12, 31); // ← null
DoranDate.fromGregorian(new Date('nope')); // ❌ RangeError پرتاب می‌کند
DoranDate.tryFromGregorian(new Date('nope')); // ← null
parseJalali('not a date'); // ← null

DoranDate.isValid(1404, 12, 31); // ← false (پیش از ساختن بررسی کنید)
```

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

#### `Duration` — نوع مدت‌زمان تغییرناپذیر

یک مدت‌زمان کوچک و immutable برای محاسبات، مقایسه و تبدیل واحد (پریتی با
moment.duration / luxon Duration). tree-shakeable — فقط جایی که لازم است import کنید.

```ts
import { Duration } from '@doranjs/core';

const d = new Duration({ hours: 1, minutes: 30 });
d.as('minute'); // 90
d.as('hour'); // 1.5
d.add({ minutes: 30 }).as('hour'); // 2
d.subtract({ minutes: 30 }).as('hour'); // 1
d.humanize(); // "یک ساعت" / "an hour" (مقدار، بدون پسوند)

Duration.fromMillis(90 * 60_000).toObject(); // { hours: 1, minutes: 30, ... }
new Duration({ hours: 2 }) > new Duration({ hours: 1 }); // true (valueOf = کل میلی‌ثانیه)
```

`as` / `toMillis` برای واحدهای طول‌متغیر از میانگین ثابت استفاده می‌کنند — هر ماه ۳۰
روز و هر سال ۳۶۵ روز، مطابق moment/luxon برای durationهای anchor‌نشده. برای deltaی
تقویمی دقیق (طول واقعی ماه/سال) از محاسبات `DoranDate` و `diff` استفاده کنید.

`diff` می‌تواند یک `Duration` تجزیه‌شده به فیلدها برگرداند:

```ts
b.diff(a, 'duration'); // Duration { days: 2, hours: 3, minutes: 30, ... }
b.diff(a, 'day'); // 2  (عدد، مثل قبل)
```

### تبدیل و قالب‌بندی

```ts
d.toGregorian(); // Date نیتیو (لحظهٔ زیرین)
d.toDate(); // نام مستعار toGregorian()
d.toTemporal(); // Temporal.ZonedDateTime (به runtime دارای Temporal نیاز دارد)
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
d.format(pattern, { digits: 'latin' | 'persian' }); // override ارقام در همان فراخوانی
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

متن literal را داخل `[brackets]` بگذارید. برای override سبک ارقام در یک فراخوانی بدون
عوض‌کردن locale، آرگومان دوم `{ digits: 'latin' | 'persian' }` را به `format` بدهید —
[Locale و ارقام](/guide/locales) را ببینید.

## Parse کردن

تجزیهٔ strict و lenient برای **هر دو** تقویم، با همان مجموعهٔ token که `format`
دارد. ارقام فارسی/عربی ابتدا نرمال می‌شوند. ورودی نامعتبر `null` برمی‌گرداند (هرگز
`Invalid Date`).

```ts
import { parse, parseJalali, parseGregorian } from '@doranjs/core';

// جلالی
parseJalali('1405/03/11');
parseJalali('۱۴۰۵-۰۳-۱۱ ۰۷:۳۰');
parseJalali('11 خرداد 1405', 'D MMMM YYYY'); // format صریح

// میلادی — برخلاف new Date(string) بین engineها سازگار است
parseGregorian('2026-05-31');
parseGregorian('2026-05-31 10:09:05');
parseGregorian('31 May 2026', 'D MMMM YYYY');

// یکپارچه، با انتخاب صریح تقویم (پیش‌فرض جلالی)
parse('1405/03/11');
parse('2026-05-31', undefined, { calendar: 'gregorian' });
```

### حالت strict

با `{ strict: true }` تطبیق دقیقِ عرض token الزامی می‌شود و sweepِ فرمت‌های پیش‌فرض
انجام نمی‌شود. برای رد ورودی ناقص یا بدشکل به‌کار می‌رود.

```ts
parseGregorian('2026-5-31', 'YYYY-MM-DD'); // → DoranDate (lenient: ۱ تا ۲ رقم)
parseGregorian('2026-5-31', 'YYYY-MM-DD', { strict: true }); // → null (MM به ۲ رقم نیاز دارد)
parseJalali('1405/3/1', 'YYYY/MM/DD', { strict: true }); // → null
```

`options` برابر `{ timeZone?, locale?, strict? }` است؛ `parse` همچنین
`calendar?: 'jalali' | 'gregorian'` را می‌پذیرد. فیلدها به‌عنوان wall-clock در
`timeZone` تفسیر می‌شوند.

## Primitiveهای تبدیل

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

## دوران و TC39 Temporal

[TC39 Temporal](https://tc39.es/proposal-temporal/) API تاریخ‌وزمانِ در راهِ پلتفرم
است. دوران از پیش همان مدل اصلی را دارد — یک مقدار **تغییرناپذیر** روی یک **لحظه +
timezone** — پس این دو تمیز با هم کار می‌کنند. شعار: _به‌شکل Temporal، با Jalali
درجه‌یک همین امروز._

پل در هر دو جهت. متدها **ساختاری** (duck-typed) و پشت یک feature detect هستند، پس
**هیچ وابستگی سختی** به `Temporal` وجود ندارد:

```ts
// از Temporal → دوران (حتی بدون runtime دارای Temporal کار می‌کند)
DoranDate.fromTemporal(zdt); // Temporal.ZonedDateTime → لحظه و zone آن را می‌گیرد
DoranDate.fromTemporal(instant, { timeZone: 'Asia/Tehran' });
DoranDate.fromTemporal(plainDateTime, { timeZone: 'UTC' }); // wall-clock در zone

// از دوران → Temporal (به Temporal در runtime نیاز دارد، وگرنه throw می‌کند)
date.toTemporal(); // Temporal.ZonedDateTime (تقویم ISO) در همان لحظه
```

`toTemporal()` یک `ZonedDateTime` در تقویم ISO (میلادی) برای همان لحظه برمی‌گرداند —
فیلدهای جلالی یک رندرِ سمتِ دوران هستند. تا وقتی Temporal در runtime شما بیاید، برای
تبادل از `toISOString()` / `fromGregorian` استفاده کنید.
