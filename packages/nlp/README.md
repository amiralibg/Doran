# @doranjs/nlp

> Persian natural-language date parsing for the Solar Hijri calendar.

Turns everyday Persian expressions like `فردا`, `جمعه ساعت ۷ شب`, and `دو هفته دیگر`
into precise [`DoranDate`](../core) values, with a confidence score.

## Install

```bash
pnpm add @doranjs/nlp @doranjs/core
```

## Usage

```ts
import { parse } from '@doranjs/nlp';

parse('جمعه ساعت ۷ شب');
// → { date: DoranDate, confidence: 0.98, matched: 'جمعه ساعت 7 شب' }

parse('دو هفته دیگر');
parse('اول ماه بعد');
parse('بیست و یکم خرداد'); // compound number words
parse('اواخر اسفند'); // anchored months
parse('جمعه هفته بعد'); // weekday in the following week
parse('نوروز سال آینده');
```

It is forgiving: Finglish and text typed with the keyboard left in English still resolve.

```ts
parse('farda'); // Finglish → فردا
parse('emshab'); // → tonight
parse('tvnh'); // US-QWERTY keystrokes for «فردا» → tomorrow
```

Pass a `reference` date to resolve relative expressions deterministically:

```ts
import { DoranDate } from '@doranjs/core';

parse('فردا', { reference: DoranDate.fromJalali(1405, 1, 1) });
```

## Supported expressions

| Category       | Examples                                                    |
| -------------- | ----------------------------------------------------------- |
| Relative days  | `امروز`, `امشب`, `فردا`, `دیروز`, `دیشب`, `پریروز`, `پریشب` |
| Weekdays       | `شنبه`, `سه شنبه آینده`, `جمعه هفته بعد`                    |
| Explicit dates | `۱۵ خرداد`, `بیست و یکم خرداد`, `۱۴۰۵/۰۳/۲۰`                |
| Units          | `دو هفته دیگر`, `۳ روز پیش`, `سال آینده`                    |
| Month anchors  | `اول ماه بعد`, `آخر ماه`, `اواخر اسفند`                     |
| Special days   | `نوروز`, `نوروز سال آینده`, `یلدا`, `سیزده به در`           |
| Time of day    | `ساعت ۷ شب`, `ساعت ۱۴:۳۰`, `شنبه صبح`, `سحر`, `نیمروز`      |

Beyond `parse`, the package also exports `parseRange` («از ۵ تا ۱۰ فروردین»),
`parseDuration` («یک ساعت و نیم»), `parseRecurrence` / `occurrences` («هر دوشنبه»,
«یک روز در میان»), and `suggest` for autocomplete. See the
[full API reference](https://amiralibg.github.io/Doran/en/api/nlp).

## Architecture

The parser is a small, modular pipeline:

1. **Normalization** — unifies digits and Arabic glyphs, strips ZWNJ/diacritics.
2. **Day extractors** — resolve the calendar day (relative, weekday, month, special).
3. **Time extractors** — resolve the time of day (explicit clock or part-of-day).
4. **Composition** — combine day + time and compute a confidence score.

It is fully extensible — register your own rules without forking the defaults:

```ts
import { Parser } from '@doranjs/nlp';

const parser = new Parser();
parser.useDay((ctx) => (/تعطیلات/.test(ctx.text) ? resolveHoliday(ctx) : null));
parser.parse('تعطیلات بعدی');
```

## License

[MIT](../../LICENSE)
