# Getting Started

Doran is a TypeScript monorepo of focused packages for the Persian (Jalali) calendar.
Install only what you need — every package is independent and tree-shakeable.

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
pnpm add @doranjs/nlp @doranjs/holidays      # logic
pnpm add @doranjs/react @doranjs/ui react react-dom  # UI
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
```

## Next steps

- Read the [Architecture](/guide/architecture) overview.
- Browse the [API Reference](/api/core).
- See full [Examples](/examples).
