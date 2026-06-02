# @doranjs/holidays

## 0.0.2

### Patch Changes

- [`015c983`](https://github.com/amiralibg/Doran/commit/015c9834c1d7235c88f8a6318dcfcbf64a79c08c) Thanks [@amiralibg](https://github.com/amiralibg)! - Improve holiday coverage and accuracy:
  - Broadened the dataset with many cultural observances and added descriptions.
  - Added `hijriMonthLength` and clamp end-of-month lunar occasions (e.g. آخر صفر) so they
    never overflow into the next month.
  - Added authoritative **per-year official date overrides** (seeded for 1404 and 1405) that
    take precedence over the approximate tabular calc, plus `registerOfficialLunarYear` to
    keep future years exact. Unseeded years still resolve via the tabular calendar, flagged
    `approximate`.

- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d)]:
  - @doranjs/core@0.0.2

## 0.0.1

### Patch Changes

- [`015c983`](https://github.com/amiralibg/Doran/commit/015c9834c1d7235c88f8a6318dcfcbf64a79c08c) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of `@doranjs/holidays`: exact solar (Jalali) national/cultural holidays,
  computed religious (lunar) holidays via a calibrated tabular Hijri calendar, custom
  holiday registration, and `getHolidays` / `isHoliday` / `getHolidaysOn` lookups.
- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d)]:
  - @doranjs/core@0.0.1
