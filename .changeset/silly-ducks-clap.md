---
'@doranjs/holidays': patch
---

Improve holiday coverage and accuracy:

- Broadened the dataset with many cultural observances and added descriptions.
- Added `hijriMonthLength` and clamp end-of-month lunar occasions (e.g. آخر صفر) so they
  never overflow into the next month.
- Added authoritative **per-year official date overrides** (seeded for 1404 and 1405) that
  take precedence over the approximate tabular calc, plus `registerOfficialLunarYear` to
  keep future years exact. Unseeded years still resolve via the tabular calendar, flagged
  `approximate`.
