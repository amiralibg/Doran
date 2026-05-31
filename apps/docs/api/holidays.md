# @doran/holidays

Iranian official, religious, and cultural holidays.

## `getHolidays`

```ts
import { getHolidays, isHoliday, getHolidaysOn } from '@doran/holidays';
import { DoranDate } from '@doran/core';

getHolidays(1405);
getHolidays(1405, { includeReligious: false, includeUnofficial: false });

isHoliday(DoranDate.fromJalali(1405, 1, 1)); // true
getHolidaysOn(DoranDate.fromJalali(1405, 1, 1));
```

A `Holiday` has `{ year, month, day, title, titleEn, type, calendar, official, approximate?, description? }`.

## Custom holidays

```ts
import { registerSolarHoliday, registerLunarHoliday, clearCustomHolidays } from '@doran/holidays';

registerSolarHoliday({
  month: 2,
  day: 2,
  title: '...',
  titleEn: '...',
  type: 'cultural',
  official: false,
});
registerLunarHoliday({
  hijriMonth: 8,
  hijriDay: 3,
  title: '...',
  titleEn: '...',
  type: 'religious',
  official: false,
});
```

## Accuracy

Solar holidays are **exact**. Religious (lunar) holidays are **computed** from a
calibrated tabular Hijri calendar and flagged `approximate: true` — they can differ from
Iran's official sighting-based announcement by ±1 day. A lunar holiday may appear zero,
one, or two times in a single Jalali year.
