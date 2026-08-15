# @doranjs/holidays

> Iranian official, religious, and cultural holidays for the Solar Hijri calendar.

## Install

```bash
pnpm add @doranjs/holidays @doranjs/core
```

## Usage

```ts
import { getHolidays, isHoliday } from '@doranjs/holidays';
import { DoranDate } from '@doranjs/core';

getHolidays(1405);
// → [{ year: 1405, month: 1, day: 1, titleEn: 'Nowruz', official: true, calendar: 'solar' }, …]

getHolidays(1405, { includeReligious: false, includeUnofficial: false });

isHoliday(DoranDate.fromJalali(1405, 1, 1)); // true
```

## Custom holidays

```ts
import { registerSolarHoliday, registerLunarHoliday } from '@doranjs/holidays';

registerSolarHoliday({
  month: 2,
  day: 2,
  title: 'سالگرد شرکت',
  titleEn: 'Company Anniversary',
  type: 'cultural',
  official: false,
});

// Anchored to the Hijri (lunar) calendar — recomputed for each year:
registerLunarHoliday({
  hijriMonth: 8,
  hijriDay: 3,
  title: 'ولادت امام حسین',
  titleEn: 'Birth of Imam Husayn',
  type: 'religious',
  official: false,
});
```

## Accuracy

- **Solar holidays** (Nowruz, 22 Bahman, …) are fixed on the Jalali calendar and **exact**.
- **Religious holidays** are anchored to the Hijri lunar calendar. Iran uses an
  _observational_ lunar calendar announced each year, so these dates are **computed**
  from the tabular Islamic calendar and flagged `approximate: true` — they may differ
  from the official announcement by ±1 day. For day-precise dates, register them
  explicitly with `registerLunarHoliday` / `registerSolarHoliday`.

Because the lunar year is ~11 days shorter than the solar year, a religious holiday can
appear **zero, one, or two times** within a single Jalali year — `getHolidays` returns
all occurrences that fall inside the year.

## License

[MIT](../../LICENSE)

## Which years are exact?

Iran announces its religious holidays by moon sighting, so they cannot be computed
exactly in advance. Authoritative dates are on file for **1404 and 1405**; every other
year falls back to the arithmetic tabular calendar and is flagged `approximate`, which
can differ from the announcement by a day.

Ask before presenting a date as fact:

```ts
import { getHolidayCoverage, getOfficialLunarYears } from '@doranjs/holidays';

getOfficialLunarYears(); // [1404, 1405]

const { official, approximate, total } = getHolidayCoverage(1410);
// official: false — lunar dates for this year are estimates
```

Keep future years exact as Iran announces them:

```ts
registerOfficialLunarYear(1406, [
  { titleEn: 'Eid al-Fitr', month: 1, day: 20 },
  // …
]);
```

Contributions of verified per-year dates are welcome — they go in
`src/official.ts`.
