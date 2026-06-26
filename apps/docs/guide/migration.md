# راهنمای مهاجرت

مهاجرت به دوران از یک کتابخانهٔ دیگرِ تاریخ فارسی معمولاً تغییری کوچک و مکانیکی است.

## جدول پریتی کامل — moment / dayjs در برابر دوران

| عملیات                 | `moment-jalaali`                     | `dayjs` (plugin جلالی)  | دوران (`@doranjs/core`)           |
| ---------------------- | ------------------------------------ | ----------------------- | --------------------------------- |
| **ایجاد اکنون**        | `moment()`                           | `dayjs()`               | `DoranDate.now()`                 |
| **از Date**            | `moment(date)`                       | `dayjs(date)`           | `DoranDate.fromGregorian(date)`   |
| **از epoch ms**        | `moment(ms)`                         | `dayjs(ms)`             | `DoranDate.fromEpochMs(ms)`       |
| **فیلدها**             | `m.jYear()` / `jMonth()` / `jDate()` | `.jYear()` / ...        | `d.year` / `d.month` / `d.day`    |
| **جمع**                | `m.add(1, 'jMonth')`                 | `.add(1, 'jMonth')`     | `d.addMonths(1)`                  |
| **تفریق**              | `m.subtract(1, 'day')`               | `.subtract(1, 'day')`   | `d.addDays(-1)`                   |
| **قالب‌بندی**          | `m.format('jYYYY/jMM/jDD')`          | `.format('jYYYY/...')`  | `d.format('YYYY/MM/DD')`          |
| **قالب میلادی**        | `m.format('YYYY-MM-DD')`             | `.format('YYYY-MM-DD')` | `d.formatGregorian('YYYY-MM-DD')` |
| **startOf**            | `m.startOf('jMonth')`                | `.startOf('month')`     | `d.startOf('month')`              |
| **diff**               | `a.diff(b, 'jMonth')`                | `.diff(b, 'month')`     | `a.diff(b, 'month')`              |
| **isBefore / isAfter** | `m.isBefore(o)`                      | `.isBefore(o)`          | `d.isBefore(o)`                   |
| **isBetween**          | `m.isBetween(a, b)`                  | `.isBetween(a, b)`      | `d.isBetween(a, b, '[]')`         |
| **fromNow**            | `m.fromNow()`                        | `.fromNow()`            | `d.fromNow()`                     |
| **به Date**            | `m.toDate()`                         | `.toDate()`             | `d.toGregorian()`                 |
| **به ISO**             | `m.toISOString()`                    | `.toISOString()`        | `d.toISOString()` ✅ میلادی UTC   |
| **ISO جلالی**          | —                                    | —                       | `d.toJalaliISO()`                 |
| **epoch**              | `m.valueOf()`                        | `.valueOf()`            | `d.valueOf()` / `d.toMillis()`    |
| **epoch ثانیه**        | `m.unix()`                           | `.unix()`               | `d.unix()`                        |
| **humanize مدت**       | `moment.duration(s,'s').humanize()`  | —                       | `durationToHuman(s)`              |
| **Immutable**          | ❌                                   | ✅                      | ✅                                |
| **بدون dependency**    | ❌                                   | ✅                      | ✅                                |
| **TypeScript-first**   | ❌                                   | partial                 | ✅                                |
| **هفته از شنبه**       | ✅                                   | plugin                  | ✅ built-in                       |

> **ماه‌ها در دوران ۱-based هستند.** `d.month === 1` یعنی فروردین.
> در `moment-jalaali`، `jMonth()` صفر-based است — هنگام مهاجرت یک واحد اضافه کنید.

## از `moment-jalaali`

```ts
// قبل
import moment from 'moment-jalaali';
const m = moment();
m.jYear();
m.jMonth() + 1;
m.jDate();
m.add(1, 'jMonth');
m.format('jYYYY/jMM/jDD');
m.toDate();
m.toISOString(); // میلادی ✅
moment.duration(seconds, 's').humanize(); // "3 hours"

// بعد
import { DoranDate, durationToHuman } from '@doranjs/core';
const d = DoranDate.now();
d.year;
d.month;
d.day;
d.addMonths(1);
d.format('YYYY/MM/DD');
d.toGregorian();
d.toISOString(); // میلادی UTC ✅
durationToHuman(seconds); // "یک ساعت"
```

تفاوت‌های کلیدی:

- دوران **immutable** است — `d.addMonths(1)` یک مقدار تازه برمی‌گرداند.
- در format tokenها پیشوند `j` وجود ندارد.
- ماه‌ها **۱-based** هستند (`1` = فروردین).

## از `jalaali-js`

| `jalaali-js`                 | دوران                           |
| ---------------------------- | ------------------------------- |
| `jalaali.toJalaali(g)`       | `gregorianToJalali(y, m, d)`    |
| `jalaali.toGregorian(j)`     | `jalaliToGregorian(jy, jm, jd)` |
| `jalaali.isLeapJalaaliYear`  | `isLeapJalaliYear`              |
| `jalaali.jalaaliMonthLength` | `jalaliMonthLength`             |

## از `dayjs` (با plugin جلالی)

`DoranDate.format` از همان واژگان tokenِ `dayjs` استفاده می‌کند، پس بیشتر format stringها
مستقیماً منتقل می‌شوند.

## RTL / رقم — نکات مهم

### رقم فارسی در برابر لاتین

locale پیش‌فرض `faIR` ارقام فارسی تولید می‌کند. برای تغییر جهانی:

```ts
import { setDefaultLocale, enUS } from '@doranjs/core';
setDefaultLocale(enUS); // ارقام لاتین در همه‌جا، از جمله pickerها
```

### رشته‌های میلادی در container‌های RTL

اگر رشتهٔ میلادی مثل `"2026-05-17 10:28"` را داخل یک container با `dir="rtl"` نمایش دهید،
مرورگر آن را معکوس می‌کند (`"10:28 2026-05-17"`). راه‌حل: یک `dir="ltr"` صریح روی عنصر:

```tsx
<span dir="ltr">{date.formatGregorian('YYYY-MM-DD HH:mm')}</span>
<span dir="ltr">{date.toISOString()}</span>
```

`date.format('YYYY/MM/DD')` (جلالی) به این نیاز ندارد.
