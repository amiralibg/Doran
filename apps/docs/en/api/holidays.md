# @doranjs/holidays

Iranian official, religious, and cultural holidays.

## `getHolidays`

```ts
import { getHolidays, isHoliday, getHolidaysOn } from '@doranjs/holidays';
import { DoranDate } from '@doranjs/core';

getHolidays(1405);
getHolidays(1405, { includeReligious: false, includeUnofficial: false });

isHoliday(DoranDate.fromJalali(1405, 1, 1)); // true
getHolidaysOn(DoranDate.fromJalali(1405, 1, 1));
```

A `Holiday` has `{ year, month, day, title, titleEn, type, calendar, official, approximate?, description? }`.

## Custom holidays

```ts
import { registerSolarHoliday, registerLunarHoliday, clearCustomHolidays } from '@doranjs/holidays';

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

Solar holidays are **exact**. Religious (lunar) holidays are resolved in two tiers:

- **Seeded years** (e.g. 1404, 1405) use **authoritative dates** from published Iranian
  calendars — exact, `approximate: false`.
- **Other years** fall back to a **tabular Hijri** calendar (calibrated to the current
  era) and are flagged `approximate: true`. Iran announces religious holidays by
  moon-sighting, so far-out years can differ by ±1 day — even popular calendars
  sometimes disagree.

Keep any year exact by registering its official dates (no release needed):

```ts
import { registerOfficialLunarYear } from '@doranjs/holidays';

registerOfficialLunarYear(1406, [
  { titleEn: 'Eid al-Ghadir', month: 2, day: 25 },
  { titleEn: 'Tasua', month: 3, day: 22 },
  // …
]);
```

A lunar holiday may appear zero, one, or two times in a single Jalali year.

## Hijri conversion

Low-level tabular Hijri ↔ JDN helpers are exported for advanced use:

```ts
import { hijriToJdn, jdnToHijri, hijriMonthLength } from '@doranjs/holidays';

hijriMonthLength(1447, 1); // 30 (Muharram)
```

## Which years are exact?

Iran announces its religious holidays by moon sighting, so they cannot be computed
exactly in advance. Authoritative dates are on file for **1404 and 1405**; other years
use the arithmetic tabular calendar and are flagged `approximate`.

```ts
getOfficialLunarYears(); // [1404, 1405]
hasOfficialLunarDates(1410); // false

const { official, approximate, total } = getHolidayCoverage(1410);
```

Keep future years exact with `registerOfficialLunarYear(year, dates)` as Iran
announces them.
