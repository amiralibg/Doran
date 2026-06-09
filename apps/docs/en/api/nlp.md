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

| Category        | Examples                                                               |
| --------------- | ---------------------------------------------------------------------- |
| Relative days   | `امروز`, `امشب`, `فردا`, `پس فردا`, `دیروز`, `دیشب`, `پریروز`, `پریشب` |
| Weekdays        | `شنبه`, `سه شنبه آینده`, `جمعه گذشته`                                  |
| Weekday + week  | `جمعه هفته بعد`, `شنبه هفته گذشته`                                     |
| Explicit dates  | `۱۵ خرداد`, `۱۵ خرداد ۱۴۰۶`, `بیست و یکم خرداد`, `۱۴۰۵/۰۳/۲۰`          |
| This period     | `این هفته`, `این ماه`, `سال جاری`                                      |
| Units           | `دو هفته دیگر`, `۳ روز پیش`, `سال آینده`                               |
| Month anchors   | `اول ماه بعد`, `آخر ماه`, `وسط ماه قبل`                                |
| Anchored months | `اول فروردین`, `اوایل خرداد`, `اواخر اسفند`                            |
| Weekend         | `آخر هفته`, `اول هفته`                                                 |
| Special days    | `نوروز`, `نوروز سال آینده`, `یلدا`, `سیزده به در`                      |
| Time of day     | `ساعت ۷ شب`, `ساعت ۱۴:۳۰`, `ساعت ۷ و نیم`, `یک ربع به ۸`               |
| Parts of day    | `صبح`, `ظهر`, `نیمروز`, `عصر`, `غروب`, `شب`, `سحر`, `شامگاه`, `بامداد` |

Day numbers may be digits (`۱۵`), single words (`پانزده`), or **compound** number
words (`بیست و یکم`, up to the hundreds — `صد و بیست و سه`). The colloquial ezafe «ی»
(`هفته‌ی بعد`) is tolerated.

## Ranges, durations & recurrence

```ts
import { parseRange, parseDuration, parseRecurrence, occurrences } from '@doranjs/nlp';
```

### `parseRange`

Resolves «از X تا Y», «X تا Y», «X الی Y», and «(ما)بین X و Y». A bare day number on the
left borrows the month/year from the right side; endpoints come back in chronological order.

```ts
parseRange('از ۵ تا ۱۰ فروردین'); // → { start: 1405/01/05, end: 1405/01/10, … }
parseRange('بین ۵ و ۱۰ فروردین'); // → same
parseRange('از فردا تا جمعه'); // → { start, end, … }
```

### `parseDuration`

```ts
parseDuration('یک ساعت و نیم'); // → { amount: 1.5, unit: 'hour', … }
parseDuration('دو هفته'); // → { amount: 2, unit: 'week', … }
parseDuration('نیم ساعت'); // → { amount: 0.5, unit: 'hour', … }
```

### `parseRecurrence` & `occurrences`

```ts
parseRecurrence('هر دوشنبه'); // → { freq: 'weekly', interval: 1, weekday: 2, … }
parseRecurrence('هر دو هفته'); // → { freq: 'weekly', interval: 2, … }
parseRecurrence('یک روز در میان'); // → { freq: 'daily', interval: 2, … }
parseRecurrence('هر شب'); // → { freq: 'daily', interval: 1, … }
parseRecurrence('هفتگی'); // adverbs: روزانه / هفتگی / ماهانه / سالانه

const rule = parseRecurrence('هر دوشنبه')!;
occurrences(rule, DoranDate.now(), 4); // → the next four Mondays
```

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
parse('emshab'); // → tonight
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

Each extractor is a small function returning a match or `null`. Earlier-registered
extractors take precedence, so you can override the defaults without forking them.

## `suggest`

Autocomplete completions for a partially-typed expression, each resolved to a preview
date where possible. Powers `DoranNlpInput` / `<doran-nlp-input>`.

```ts
import { suggest } from '@doranjs/nlp';

suggest('جم'); // → [{ value: 'جمعه', date }, { value: 'جمعه آینده', date }, …]
suggest('هفته'); // → [{ value: 'هفته بعد', date }, …]
```

## `parsePersianNumber`

Parses a Persian cardinal number written with digits or words, including compounds.

```ts
import { parsePersianNumber } from '@doranjs/nlp';

parsePersianNumber('بیست و یک'); // → 21
parsePersianNumber('صد و بیست و سه'); // → 123
parsePersianNumber('۱۵'); // → 15
```

Also exported: `normalize`, `remapKeyboard`, `transliterateFinglish`, `registerFinglish`,
and the default extractors.
