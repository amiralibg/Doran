# @doranjs/holidays

تعطیلات رسمی، مذهبی و فرهنگیِ ایران.

## `getHolidays`

```ts
import { getHolidays, isHoliday, getHolidaysOn } from '@doranjs/holidays';
import { DoranDate } from '@doranjs/core';

getHolidays(1405);
getHolidays(1405, { includeReligious: false, includeUnofficial: false });

isHoliday(DoranDate.fromJalali(1405, 1, 1)); // true
getHolidaysOn(DoranDate.fromJalali(1405, 1, 1));
```

هر `Holiday` این شکل را دارد: `{ year, month, day, title, titleEn, type, calendar, official, approximate?, description? }`.

## تعطیلات سفارشی

```ts
import { registerSolarHoliday, registerLunarHoliday, clearCustomHolidays } from '@doranjs/holidays';

registerSolarHoliday({
  month: 2,
  day: 2,
  title: '...',
  titleEn: '...',
  type: 'cultural',
  official: false,
});
registerLunarHoliday({
  hijriMonth: 8,
  hijriDay: 3,
  title: '...',
  titleEn: '...',
  type: 'religious',
  official: false,
});
```

## دقت

تعطیلات شمسی **دقیق** هستند. تعطیلات مذهبی (قمری) در دو لایه resolve می‌شوند:

- **سال‌های seed‌شده** (مثلاً ۱۴۰۴، ۱۴۰۵) از **تاریخ‌های معتبر** تقویم‌های منتشرشدهٔ ایرانی
  استفاده می‌کنند — دقیق، با `approximate: false`.
- **سال‌های دیگر** به یک تقویم **هجریِ جدولی (tabular)** برمی‌گردند (کالیبره‌شده با دورهٔ
  کنونی) و با `approximate: true` نشانه‌گذاری می‌شوند. ایران تعطیلات مذهبی را با رؤیت هلال
  اعلام می‌کند، پس سال‌های دور ممکن است ±۱ روز تفاوت کنند — حتی تقویم‌های پرکاربرد هم گاهی
  با هم اختلاف دارند.

هر سال را با register کردن تاریخ‌های رسمی‌اش دقیق نگه دارید (بدون نیاز به release):

```ts
import { registerOfficialLunarYear } from '@doranjs/holidays';

registerOfficialLunarYear(1406, [
  { titleEn: 'Eid al-Ghadir', month: 2, day: 25 },
  { titleEn: 'Tasua', month: 3, day: 22 },
  // …
]);
```

یک تعطیلِ قمری ممکن است در یک سال جلالی صفر، یک یا دو بار ظاهر شود.

## تبدیل هجری

برای استفاده‌های پیشرفته، helperهای سطح‌پایینِ هجریِ جدولی ↔ JDN export شده‌اند:

```ts
import { hijriToJdn, jdnToHijri, hijriMonthLength } from '@doranjs/holidays';

hijriMonthLength(1447, 1); // 30 (محرم)
```

## کدام سال‌ها دقیق‌اند؟

ایران تعطیلات مذهبی را با رؤیت هلال اعلام می‌کند، پس از پیش دقیق محاسبه‌شدنی نیستند.
تاریخ‌های رسمی برای **۱۴۰۴ و ۱۴۰۵** موجود است؛ سال‌های دیگر از تقویم حسابی استفاده
می‌کنند و با `approximate` علامت می‌خورند.

```ts
getOfficialLunarYears(); // [1404, 1405]
hasOfficialLunarDates(1410); // false

const { official, approximate, total } = getHolidayCoverage(1410);
```

با `registerOfficialLunarYear(year, dates)` سال‌های آینده را با اعلام رسمی دقیق کنید.
