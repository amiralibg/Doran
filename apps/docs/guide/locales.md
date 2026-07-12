# Locale و ارقام

دو چیز بسته به مخاطب تغییر می‌کند: **locale** (نام ماه/روز هفته، عبارت‌های زمان
نسبی و برچسب کنترل‌های تقویم) و **سبک ارقام** (فارسی `۱۴۰۵` در برابر لاتین `1405`).
دوران این دو را جدا نگه می‌دارد تا یک UI انگلیسیِ LTR بتواند نام ماه فارسی را با
ارقام لاتین — یا هر ترکیب دیگری — نشان دهد، بدون جنگیدن با سیستم locale.

## ترتیب اولویت locale

وقتی مقداری به locale نیاز دارد، دوران به این ترتیب آن را resolve می‌کند — اولین تطبیق
برنده است:

```
locale در محل فراخوانی  →  پیش‌فرض سراسری  →  fa-IR داخلی
      (هر فراخوانی)         (setDefaultLocale)     (fallback)
```

```ts
import { DoranDate, enUS, setDefaultLocale } from '@doranjs/core';

// ۳. fallback داخلی: اگر چیزی تنظیم نکنید، fa-IR (فارسی).
DoranDate.fromJalali(1405, 3, 11).format('dddd'); // "دوشنبه"

// ۲. پیش‌فرض سراسری: یک‌بار در ابتدای اپ تنظیم کنید.
setDefaultLocale(enUS);
DoranDate.fromJalali(1405, 3, 11).format('dddd'); // "Doshanbe"

// ۱. محل فراخوانی بر پیش‌فرض سراسری اولویت دارد.
DoranDate.fromJalali(1405, 3, 11, { locale: 'fa-IR' }).format('dddd'); // "دوشنبه"
```

`withLocale` یک نمونهٔ تازه می‌سازد که به یک locale سنجاق شده است، معادل پاس‌دادن
`{ locale }` در محل فراخوانی:

```ts
date.withLocale(enUS).format('dddd D MMMM YYYY'); // "Doshanbe 11 Khordad 1405"
```

::: tip تحمیل یک locale در کل اپ
برای یک UI انگلیسیِ LTR، یک‌بار در ابتدا `setDefaultLocale(enUS)` را صدا بزنید. آنگاه
هر `DoranDate` به‌صورت پیش‌فرض نام انگلیسی + ارقام لاتین خواهد داشت، بدون نیاز به
گزینه در هر فراخوانی.
:::

کنترل‌های تقویم نیز برچسب‌های خود را از همین locale می‌گیرند:

```ts
import { enUS, resolveCalendarLabels } from '@doranjs/core';

resolveCalendarLabels(enUS); // { today: "Today", clear: "Clear" }
```

در localeهای سفارشی می‌توانید `calendarLabels` را تعریف کنید. localeهای سفارشی
قدیمی که آن را ندارند همچنان سازگارند و از برچسب‌های فارسی استفاده می‌کنند.

> در React، `DoranProvider` می‌تواند locale را به یک زیردرخت محدود کند. بایندینگ‌های
> مبتنی‌بر وب‌کامپوننت (Vue، Svelte و Angular) روی هر کامپوننت
> `locale="fa"` یا `locale="en"` می‌پذیرند.

## کنترل ارقام در هر فراخوانی

سبک ارقام مستقل از locale است. با `{ digits }` به `format` فقط ارقام همان فراخوانی را
override کنید — نام‌ها همچنان از locale می‌آیند:

```ts
const d = DoranDate.fromJalali(1405, 3, 11); // fa-IR → پیش‌فرض ارقام فارسی

d.format('YYYY/MM/DD'); // "۱۴۰۵/۰۳/۱۱"  (پیش‌فرض locale)
d.format('YYYY/MM/DD', { digits: 'latin' }); // "1405/03/11"
d.format('D MMMM', { digits: 'latin' }); // "11 خرداد"  ← رقم لاتین، نام فارسی

// و برعکس، زیر یک locale لاتین:
d.withLocale(enUS).format('YYYY/MM/DD', { digits: 'persian' }); // "۱۴۰۵/۰۳/۱۱"
```

`digits` مقدار `'latin' | 'persian'` می‌پذیرد. آن را حذف کنید تا از هر چه locale فعال
تعریف می‌کند استفاده شود (`fa-IR` → فارسی، `en-US` → لاتین).

### چرا فقط locale را عوض نکنیم؟

عوض‌کردن به `enUS` برای گرفتن ارقام لاتین، نام ماه/روز و برچسب کنترل‌های تقویم را
هم به انگلیسی عوض می‌کند. وقتی نام فارسی با ارقام لاتین می‌خواهید (رایج در UIهای
دوزبانه)، کلید `digits` در هر فراخوانی مسیر ارگونومیک است — بدون نیاز به locale
سفارشی.

## ابزارهای رقم

برای رشته‌های خام (نه تاریخ‌های قالب‌بندی‌شده)، مبدل‌های رقم مستقیماً export شده‌اند:

```ts
import { toPersianDigits, toLatinDigits, normalizeDigits } from '@doranjs/core';

toPersianDigits('1405'); // "۱۴۰۵"
normalizeDigits('۱۴۰۵'); // "1405"  (فارسی/عربی → ASCII، برای parse ورودی)
```
