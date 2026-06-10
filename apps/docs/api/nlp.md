# @doranjs/nlp

Parse کردن تاریخ از زبان طبیعیِ فارسی، ساخته‌شده بر پایهٔ `@doranjs/core`.

## `parse`

```ts
import { parse } from '@doranjs/nlp';

parse('فردا');
parse('جمعه ساعت ۷ شب'); // → { date: DoranDate, confidence: 0.98, matched: '...' }
parse('دو هفته دیگر', { reference: DoranDate.fromJalali(1405, 1, 1) });
```

مقدار `{ date, confidence, matched } | null` را برمی‌گرداند. برای کنترل resolution،
`{ reference, timeZone, locale }` را در `options` بدهید.

## عبارت‌های پشتیبانی‌شده

| دسته              | نمونه‌ها                                                               |
| ----------------- | ---------------------------------------------------------------------- |
| روزهای نسبی       | `امروز`، `امشب`، `فردا`، `پس فردا`، `دیروز`، `دیشب`، `پریروز`، `پریشب` |
| روزهای هفته       | `شنبه`، `سه شنبه آینده`، `جمعه گذشته`                                  |
| روز هفته + هفته   | `جمعه هفته بعد`، `شنبه هفته گذشته`                                     |
| تاریخ‌های صریح    | `۱۵ خرداد`، `۱۵ خرداد ۱۴۰۶`، `بیست و یکم خرداد`، `۱۴۰۵/۰۳/۲۰`          |
| این بازه          | `این هفته`، `این ماه`، `سال جاری`                                      |
| واحدها            | `دو هفته دیگر`، `۳ روز پیش`، `سال آینده`                               |
| anchorهای ماه     | `اول ماه بعد`، `آخر ماه`، `وسط ماه قبل`                                |
| ماه‌های anchorدار | `اول فروردین`، `اوایل خرداد`، `اواخر اسفند`                            |
| آخر هفته          | `آخر هفته`، `اول هفته`                                                 |
| روزهای خاص        | `نوروز`، `نوروز سال آینده`، `یلدا`، `سیزده به در`                      |
| ساعت روز          | `ساعت ۷ شب`، `ساعت ۱۴:۳۰`، `ساعت ۷ و نیم`، `یک ربع به ۸`               |
| بخش‌های روز       | `صبح`، `ظهر`، `نیمروز`، `عصر`، `غروب`، `شب`، `سحر`، `شامگاه`، `بامداد` |

شمارهٔ روز می‌تواند رقمی (`۱۵`)، تک‌واژه‌ای (`پانزده`) یا **مرکب** باشد (`بیست و یکم`،
تا حد صدگان — `صد و بیست و سه`). «ی»ِ اضافهٔ محاوره‌ای (`هفته‌ی بعد`) نیز پذیرفته می‌شود.

## Rangeها، durationها و recurrence

```ts
import { parseRange, parseDuration, parseRecurrence, occurrences } from '@doranjs/nlp';
```

### `parseRange`

عبارت‌های «از X تا Y»، «X تا Y»، «X الی Y» و «(ما)بین X و Y» را resolve می‌کند. اگر سمت چپ
فقط یک شمارهٔ روز باشد، ماه/سال را از سمت راست قرض می‌گیرد؛ دو سر بازه به‌ترتیب زمانی برمی‌گردند.

```ts
parseRange('از ۵ تا ۱۰ فروردین'); // → { start: 1405/01/05, end: 1405/01/10, … }
parseRange('بین ۵ و ۱۰ فروردین'); // → همان
parseRange('از فردا تا جمعه'); // → { start, end, … }
```

### `parseDuration`

```ts
parseDuration('یک ساعت و نیم'); // → { amount: 1.5, unit: 'hour', … }
parseDuration('دو هفته'); // → { amount: 2, unit: 'week', … }
parseDuration('نیم ساعت'); // → { amount: 0.5, unit: 'hour', … }
```

### `parseRecurrence` و `occurrences`

```ts
parseRecurrence('هر دوشنبه'); // → { freq: 'weekly', interval: 1, weekday: 2, … }
parseRecurrence('هر دو هفته'); // → { freq: 'weekly', interval: 2, … }
parseRecurrence('یک روز در میان'); // → { freq: 'daily', interval: 2, … }
parseRecurrence('هر شب'); // → { freq: 'daily', interval: 1, … }
parseRecurrence('هفتگی'); // قیدها: روزانه / هفتگی / ماهانه / سالانه

const rule = parseRecurrence('هر دوشنبه')!;
occurrences(rule, DoranDate.now(), 4); // → چهار دوشنبهٔ بعدی
```

## ورودیِ بخشنده

وقتی متن مستقیماً parse نشود، parser دو pass نجات را امتحان می‌کند (پس هیچ ضرری ندارد —
این‌ها فقط یک `null` را به یک نتیجه تبدیل می‌کنند):

| سبک ورودی                 | نمونه                        | resolve می‌شود به           |
| ------------------------- | ---------------------------- | --------------------------- |
| تنوع‌های املایی           | `مئبد` ≈ `میبد`              | با `normalize` یکدست می‌شود |
| Finglish (خط لاتین)       | `farda`، `jomeh saat 7 shab` | `فردا`، «جمعه ساعت ۷ شب»    |
| کیبورد روی layout انگلیسی | `tvnh`                       | `فردا`                      |

```ts
import { parse, remapKeyboard, transliterateFinglish, registerFinglish } from '@doranjs/nlp';

parse('farda'); // → فردا
parse('emshab'); // → امشب
parse('tvnh'); // → فردا (کلیدهای US-QWERTY برای «فردا»)

remapKeyboard('dcn'); // → 'یزد'
transliterateFinglish('jomeh saat 7 shab'); // → 'جمعه ساعت 7 شب'

registerFinglish('jaleseh', 'جلسه'); // alias‌های خودتان را یاد بدهید
```

## Parserِ قابل توسعه

```ts
import { Parser } from '@doranjs/nlp';

const parser = new Parser();
parser.useDay((ctx) => (/تعطیلات/.test(ctx.text) ? resolveHoliday(ctx) : null));
parser.parse('تعطیلات بعدی');
```

هر extractor یک تابع کوچک است که یک match یا `null` برمی‌گرداند. extractorهایی که زودتر
register شده‌اند اولویت دارند، پس می‌توانید پیش‌فرض‌ها را بدون fork کردن override کنید.

## `suggest`

تکمیل خودکار (autocomplete) برای عبارتی که نیمه‌تایپ شده، و در حد امکان هر مورد به یک تاریخِ
پیش‌نمایش resolve می‌شود. موتورِ `DoranNlpInput` / `<doran-nlp-input>` همین است.

```ts
import { suggest } from '@doranjs/nlp';

suggest('جم'); // → [{ value: 'جمعه', date }, { value: 'جمعه آینده', date }, …]
suggest('هفته'); // → [{ value: 'هفته بعد', date }, …]
```

## `parsePersianNumber`

یک عددِ اصلیِ فارسی را که با رقم یا واژه نوشته شده — از جمله اعداد مرکب — parse می‌کند.

```ts
import { parsePersianNumber } from '@doranjs/nlp';

parsePersianNumber('بیست و یک'); // → 21
parsePersianNumber('صد و بیست و سه'); // → 123
parsePersianNumber('۱۵'); // → 15
```

همچنین export می‌شوند: `normalize`، `remapKeyboard`، `transliterateFinglish`، `registerFinglish`
و extractorهای پیش‌فرض.
