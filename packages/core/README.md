# @doranjs/core

> Immutable, accurate Solar Hijri (Persian / Jalali) date engine.

The foundation of the [Doran](https://github.com/amiralibg/Doran) ecosystem. Zero runtime
dependencies, tree-shakeable, and strongly typed.

## Install

```bash
pnpm add @doranjs/core
```

## Usage

```ts
import { DoranDate } from '@doranjs/core';

const today = DoranDate.now();

today.format('YYYY/MM/DD'); // "۱۴۰۵/۰۳/۱۱"
today.addDays(10).format('dddd D MMMM YYYY');
today.addMonths(1);
today.toGregorian(); // native Date

DoranDate.fromGregorian(new Date());
DoranDate.fromJalali(1405, 3, 11, { timeZone: 'Asia/Tehran' });
```

### Parsing

```ts
import { parseJalali } from '@doranjs/core';

parseJalali('1405/03/11');
parseJalali('۱۴۰۵-۰۳-۱۱ ۰۷:۳۰');
parseJalali('11 خرداد 1405', 'D MMMM YYYY');
```

### Conversion primitives

```ts
import { jalaliToGregorian, gregorianToJalali, isLeapJalaliYear } from '@doranjs/core';

jalaliToGregorian(1400, 1, 1); // { year: 2021, month: 3, day: 21 }
gregorianToJalali(2021, 3, 21); // { year: 1400, month: 1, day: 1 }
isLeapJalaliYear(1399); // true
```

## Key ideas

- **Immutable** — every `addX` / `withX` returns a new `DoranDate`.
- **Instant-based** — a date is an absolute instant plus an IANA time zone, so
  conversions and time-zone changes are always exact.
- **Accurate** — conversion uses the well-established Borkowski / jalaali algorithm,
  validated by an exhaustive day-by-day round-trip test suite.

See the [full API reference](https://github.com/amiralibg/Doran) for every method and
format token.

## License

[MIT](../../LICENSE)
