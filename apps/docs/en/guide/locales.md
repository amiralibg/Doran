# Locales & digits

Two things vary by audience: the **locale** (month/weekday names, relative-time
phrases, and calendar control labels) and the **digit style** (Persian `۱۴۰۵` vs
Latin `1405`). Doran keeps them separable so an English LTR UI can show Persian
month names with Latin digits — or any other mix — without fighting the locale
system.

## Locale precedence

When a value needs a locale, Doran resolves it in this order — first match wins:

```
call-site locale  →  global default  →  built-in fa-IR
   (per call)         (setDefaultLocale)    (fallback)
```

```ts
import { DoranDate, enUS, setDefaultLocale } from '@doranjs/core';

// 3. Built-in fallback: fa-IR (Persian) if you set nothing.
DoranDate.fromJalali(1405, 3, 11).format('dddd'); // "دوشنبه"

// 2. Global default: set once at app startup.
setDefaultLocale(enUS);
DoranDate.fromJalali(1405, 3, 11).format('dddd'); // "Doshanbe"

// 1. Call-site wins over the global default.
DoranDate.fromJalali(1405, 3, 11, { locale: 'fa-IR' }).format('dddd'); // "دوشنبه"
```

`withLocale` returns a new instance pinned to a locale, equivalent to passing
`{ locale }` at the call site:

```ts
date.withLocale(enUS).format('dddd D MMMM YYYY'); // "Doshanbe 11 Khordad 1405"
```

::: tip Forcing one locale app-wide
For an LTR English UI, call `setDefaultLocale(enUS)` once at startup. Every
`DoranDate` then defaults to English names + Latin digits, with no per-call
options needed.
:::

Calendar controls use labels from the same locale:

```ts
import { enUS, resolveCalendarLabels } from '@doranjs/core';

resolveCalendarLabels(enUS); // { today: "Today", clear: "Clear" }
```

Custom `Locale` objects can provide `calendarLabels`. Existing custom locales
that omit them remain compatible and use the Persian control labels.

> In React, `DoranProvider` can scope a locale to one subtree. The
> web-component bindings (Vue, Svelte, and Angular) accept `locale="fa"` or
> `locale="en"` on each component.

## Per-call digit control

Digit style is independent of the locale. Pass `{ digits }` to `format` to
override just the numerals for that one call — names still come from the locale:

```ts
const d = DoranDate.fromJalali(1405, 3, 11); // fa-IR → Persian digits by default

d.format('YYYY/MM/DD'); // "۱۴۰۵/۰۳/۱۱"  (locale default)
d.format('YYYY/MM/DD', { digits: 'latin' }); // "1405/03/11"
d.format('D MMMM', { digits: 'latin' }); // "11 خرداد"  ← Latin digit, Persian name

// And the other way, under a Latin locale:
d.withLocale(enUS).format('YYYY/MM/DD', { digits: 'persian' }); // "۱۴۰۵/۰۳/۱۱"
```

`digits` accepts `'latin' | 'persian'`. Omit it to use whatever the active
locale defines (`fa-IR` → Persian, `en-US` → Latin).

### Why not just swap the locale?

Swapping to `enUS` to get Latin digits also swaps month/weekday names and
calendar control labels to English. When you want Persian names with Latin
digits (common in bilingual UIs), the per-call `digits` switch is the ergonomic
path — no custom locale required.

## Digit utilities

For raw strings (not formatted dates), the digit converters are exported directly:

```ts
import { toPersianDigits, toLatinDigits, normalizeDigits } from '@doranjs/core';

toPersianDigits('1405'); // "۱۴۰۵"
normalizeDigits('۱۴۰۵'); // "1405"  (Persian/Arabic → ASCII, for parsing input)
toLatinDigits('١٤٠٥'); // "1405"  (alias of normalizeDigits)
```

Reach for `normalizeDigits` on any user-typed value — phone numbers, card
numbers, dates — before you validate or store it. Persian keyboards produce
`۰۹۱۲…`, which silently fails `/[0-9]/` checks. ASCII input passes through
unchanged, so it is safe to apply unconditionally.
