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

| Category       | Examples                                                 |
| -------------- | -------------------------------------------------------- |
| Relative days  | `امروز`, `فردا`, `پس فردا`, `دیروز`, `پریروز`            |
| Weekdays       | `شنبه`, `سه شنبه آینده`, `جمعه گذشته`                    |
| Explicit dates | `۱۵ خرداد`, `۱۵ خرداد ۱۴۰۶`, `پانزده تیر`, `۱۴۰۵/۰۳/۲۰`  |
| This period    | `این هفته`, `این ماه`, `سال جاری`                        |
| Units          | `دو هفته دیگر`, `۳ روز پیش`, `سال آینده`                 |
| Month anchors  | `اول ماه بعد`, `آخر ماه`, `وسط ماه قبل`                  |
| Weekend        | `آخر هفته`, `اول هفته`                                   |
| Special days   | `نوروز`, `نوروز سال آینده`, `یلدا`, `سیزده به در`        |
| Time of day    | `ساعت ۷ شب`, `ساعت ۱۴:۳۰`, `ساعت ۷ و نیم`, `یک ربع به ۸` |

## Forgiving input

When the text doesn't parse directly, the parser tries two rescue passes (so there's no
downside — these only ever turn a `null` into a hit):

| Input style              | Example                      | Resolves to              |
| ------------------------ | ---------------------------- | ------------------------ |
| Spelling variants        | `مئبد` ≈ `میبد`              | folded by `normalize`    |
| Finglish (Latin-script)  | `farda`, `jomeh saat 7 shab` | `فردا`, «جمعه ساعت ۷ شب» |
| Keyboard left in English | `tvnh`                       | `فردا`                   |

```ts
import { parse, remapKeyboard, transliterateFinglish, registerFinglish } from '@doranjs/nlp';

parse('farda'); // → tomorrow
parse('tvnh'); // → tomorrow (US-QWERTY keystrokes for «فردا»)

remapKeyboard('dcn'); // → 'یزد'
transliterateFinglish('jomeh saat 7 shab'); // → 'جمعه ساعت 7 شب'

registerFinglish('jaleseh', 'جلسه'); // teach it your own aliases
```

## Extensible parser

```ts
import { Parser } from '@doranjs/nlp';

const parser = new Parser();
parser.useDay((ctx) => (/تعطیلات/.test(ctx.text) ? resolveHoliday(ctx) : null));
parser.parse('تعطیلات بعدی');
```

## `suggest`

Autocomplete completions for a partially-typed expression, each resolved to a preview
date where possible. Powers `DoranNlpInput` / `<doran-nlp-input>`.

```ts
import { suggest } from '@doranjs/nlp';

suggest('جم'); // → [{ value: 'جمعه', date }, { value: 'جمعه آینده', date }, …]
suggest('هفته'); // → [{ value: 'هفته بعد', date }, …]
```

Also exported: `normalize`, `parsePersianNumber`, `remapKeyboard`, `transliterateFinglish`,
`registerFinglish`, and the default extractors.
