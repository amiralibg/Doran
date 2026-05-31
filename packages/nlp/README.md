# @doran/nlp

> Persian natural-language date parsing for the Solar Hijri calendar.

Turns everyday Persian expressions like `فردا`, `جمعه ساعت ۷ شب`, and `دو هفته دیگر`
into precise [`DoranDate`](../core) values, with a confidence score.

## Install

```bash
pnpm add @doran/nlp @doran/core
```

## Usage

```ts
import { parse } from '@doran/nlp';

parse('جمعه ساعت ۷ شب');
// → { date: DoranDate, confidence: 0.98, matched: 'جمعه ساعت 7 شب' }

parse('دو هفته دیگر');
parse('اول ماه بعد');
parse('نوروز سال آینده');
```

Pass a `reference` date to resolve relative expressions deterministically:

```ts
import { DoranDate } from '@doran/core';

parse('فردا', { reference: DoranDate.fromJalali(1405, 1, 1) });
```

## Supported expressions

| Category      | Examples                                          |
| ------------- | ------------------------------------------------- |
| Relative days | `امروز`, `فردا`, `پس فردا`, `دیروز`, `پریروز`     |
| Weekdays      | `شنبه`, `سه شنبه آینده`, `جمعه گذشته`             |
| Units         | `دو هفته دیگر`, `۳ روز پیش`, `سال آینده`          |
| Month anchors | `اول ماه بعد`, `آخر ماه`, `وسط ماه قبل`           |
| Special days  | `نوروز`, `نوروز سال آینده`, `یلدا`, `سیزده به در` |
| Time of day   | `ساعت ۷ شب`, `ساعت ۱۴:۳۰`, `شنبه صبح`             |

## Architecture

The parser is a small, modular pipeline:

1. **Normalization** — unifies digits and Arabic glyphs, strips ZWNJ/diacritics.
2. **Day extractors** — resolve the calendar day (relative, weekday, month, special).
3. **Time extractors** — resolve the time of day (explicit clock or part-of-day).
4. **Composition** — combine day + time and compute a confidence score.

It is fully extensible — register your own rules without forking the defaults:

```ts
import { Parser } from '@doran/nlp';

const parser = new Parser();
parser.useDay((ctx) => (/تعطیلات/.test(ctx.text) ? resolveHoliday(ctx) : null));
parser.parse('تعطیلات بعدی');
```

## License

[MIT](../../LICENSE)
