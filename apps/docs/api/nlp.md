# @doranjs/nlp

Persian natural-language date parsing, built on `@doranjs/core`.

## `parse`

```ts
import { parse } from '@doranjs/nlp';

parse('فردا');
parse('جمعه ساعت ۷ شب'); // → { date: DoranDate, confidence: 0.98, matched: '...' }
parse('دو هفته دیگر', { reference: DoranDate.fromJalali(1405, 1, 1) });
```

Returns `{ date, confidence, matched } | null`. Pass `{ reference, timeZone, locale }`
in `options` to control resolution.

## Supported expressions

| Category      | Examples                                          |
| ------------- | ------------------------------------------------- |
| Relative days | `امروز`, `فردا`, `پس فردا`, `دیروز`, `پریروز`     |
| Weekdays      | `شنبه`, `سه شنبه آینده`, `جمعه گذشته`             |
| Units         | `دو هفته دیگر`, `۳ روز پیش`, `سال آینده`          |
| Month anchors | `اول ماه بعد`, `آخر ماه`, `وسط ماه قبل`           |
| Special days  | `نوروز`, `نوروز سال آینده`, `یلدا`, `سیزده به در` |
| Time of day   | `ساعت ۷ شب`, `ساعت ۱۴:۳۰`, `شنبه صبح`             |

## Extensible parser

```ts
import { Parser } from '@doranjs/nlp';

const parser = new Parser();
parser.useDay((ctx) => (/تعطیلات/.test(ctx.text) ? resolveHoliday(ctx) : null));
parser.parse('تعطیلات بعدی');
```

Also exported: `normalize`, `parsePersianNumber`, and the default extractors.
