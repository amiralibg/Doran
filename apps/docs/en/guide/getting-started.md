# Getting Started

Doran is a TypeScript monorepo of focused packages for the Persian (Jalali) calendar.
Install only what you need — every package is independent and tree-shakeable.

## The mental model: one instant, two calendars

Read this first — it prevents the most common (and most expensive) mistake.

A `DoranDate` is a single **instant** in time. That instant can be _rendered_ two ways:

- **Jalali** for your users — `format(...)`
- **Gregorian** for your backend — `formatGregorian(...)`, `toISOString()`

> Same instant, two views. `format` is what a person reads; `toISOString()` is what a
> server stores. They describe the _same moment_ — they are not different dates.

```ts
const d = DoranDate.now();

d.format('YYYY/MM/DD'); // "۱۴۰۵/۰۳/۱۱"  → show this to the user
d.toISOString(); // "2026-06-01T08:00:00.000Z"  → send this to the server
```

⚠️ `toISOString()` is **Gregorian UTC** — safe to send to any backend. Do **not** send
`toJalaliISO()` to your API. See [Backends & serialization](/en/guide/backends) for the
full recipe and round-trip.

## Installation

::: code-group

```bash [pnpm]
pnpm add @doranjs/core
```

```bash [npm]
npm install @doranjs/core
```

```bash [yarn]
yarn add @doranjs/core
```

:::

The other packages build on the core:

```bash
pnpm add @doranjs/nlp @doranjs/holidays              # logic
pnpm add @doranjs/react @doranjs/ui react react-dom  # React UI
pnpm add @doranjs/wc                                 # Web Components (any framework / plain HTML)
```

## Your first date

```ts
import { DoranDate } from '@doranjs/core';

const today = DoranDate.now();

today.year; // 1405
today.format('YYYY/MM/DD'); // "۱۴۰۵/۰۳/۱۱"
today.addDays(10).format('dddd D MMMM YYYY'); // "..."
```

`DoranDate` is **immutable** — every `add*` / `with*` method returns a new instance.

## Converting to and from Gregorian

```ts
DoranDate.fromGregorian(new Date()); // from a native Date
DoranDate.fromJalali(1405, 3, 11); // from Jalali fields
DoranDate.now().toGregorian(); // back to a native Date
```

## Time zones & locales

A `DoranDate` is an absolute instant plus an IANA time zone, so conversions are exact.

```ts
const tehran = DoranDate.fromJalali(1405, 3, 11, { timeZone: 'Asia/Tehran' });
tehran.withTimeZone('UTC'); // same instant, different wall clock
tehran.withLocale('en-US').format('dddd D MMMM YYYY'); // Latin output
```

## Parsing natural language

```ts
import { parse } from '@doranjs/nlp';

parse('جمعه ساعت ۷ شب'); // { date: DoranDate, confidence: 0.98, matched: '...' }
parse('farda'); // Finglish also works → فردا
parse('tvnh'); // even text typed with the keyboard left in English → فردا
```

## Use in plain HTML (Web Components)

No bundler or framework required — import the package (which registers the elements)
and the stylesheet:

```html
<link rel="stylesheet" href="https://unpkg.com/@doranjs/wc/dist/styles.css" />
<script src="https://unpkg.com/@doranjs/wc/dist/doran.global.js"></script>

<doran-calendar show-holidays></doran-calendar>
<doran-datepicker with-time></doran-datepicker>
<doran-nlp-input></doran-nlp-input>
```

See [`@doranjs/wc`](/en/api/wc) for all elements, attributes, and events.

## Next steps

- Read the [Architecture](/en/guide/architecture) overview.
- Browse the [API Reference](/en/api/core).
- See full [Examples](/en/examples).
