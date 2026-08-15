---
'@doranjs/holidays': minor
'@doranjs/react': minor
---

Report holiday coverage, and make the components usable without the stylesheet.

**Holiday coverage.** Iran announces its religious holidays by moon sighting, so no
library can compute them exactly in advance — authoritative dates are on file for 1404
and 1405, and every other year falls back to a tabular approximation that can land a
day either side. Rather than invent the missing years, this exposes which ones are
announced:

```ts
const { official, approximate } = getHolidayCoverage(1410);
if (!official) showNotice('Religious holidays for this year are estimates.');
```

New in `@doranjs/holidays`: `getHolidayCoverage`, `getOfficialLunarYears`, and
`hasOfficialLunarDates`. Surfaced in React as `useHolidays().coverage(year)`. Feed your
own announced dates with the existing `registerOfficialLunarYear`.

**Unstyled usage.** Skipping `@doranjs/react/styles.css` already gave you the markup,
keyboard model, and ARIA with no visual opinions — except that the day-navigation live
region's visually-hidden styling lived only in the stylesheet, so an app that skipped
the CSS printed every announcement on screen. That is behaviour rather than
decoration, so it is now inlined.

`classNames` also reaches further: `DoranCalendar` takes `{ root, footer, footerAction,
month }`, and `DoranMonthView` takes `{ grid, weekdays, weekday, week, cell, day }`.
Your classes merge with Doran's rather than replacing them.

**Not shipped: a `@doranjs/react/nlp` subpath.** Measured rather than assumed —
esbuild produces 15.96 kB gzipped without `DoranNlpInput` and 22.24 kB with it, and
Rollup agrees. `@doranjs/nlp` already tree-shakes, costing 6.3 kB gzipped only when
imported, so a subpath would add an entry point and a migration for no gain. CJS
consumers do not tree-shake and will still pull it in.
