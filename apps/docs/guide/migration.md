# Migration Guide

Moving to Doran from another Persian-date library is usually a small, mechanical change.

## From `moment-jalaali`

| `moment-jalaali`                     | Doran (`@doranjs/core`)         |
| ------------------------------------ | ------------------------------- |
| `moment()`                           | `DoranDate.now()`               |
| `moment(date)`                       | `DoranDate.fromGregorian(date)` |
| `m.jYear()` / `jMonth()` / `jDate()` | `d.year` / `d.month` / `d.day`  |
| `m.add(1, 'jMonth')`                 | `d.addMonths(1)`                |
| `m.format('jYYYY/jMM/jDD')`          | `d.format('YYYY/MM/DD')`        |
| `m.toDate()`                         | `d.toGregorian()`               |

Key differences:

- Doran is **immutable** — `d.addMonths(1)` returns a new value; it does not mutate `d`.
- There is no `j` prefix in format tokens; tokens are always interpreted in the Jalali
  calendar.
- Months are **1-based** (`1` = Farvardin), unlike Moment's 0-based `jMonth()`.

## From `jalaali-js`

`jalaali-js` exposes raw conversion functions. Doran offers the same primitives plus a
rich `DoranDate`:

| `jalaali-js`                 | Doran                                                  |
| ---------------------------- | ------------------------------------------------------ |
| `jalaali.toJalaali(g)`       | `gregorianToJalali(y, m, d)`                           |
| `jalaali.toGregorian(j)`     | `jalaaliToGregorian(jy, jm, jd)` (`jalaliToGregorian`) |
| `jalaali.isLeapJalaaliYear`  | `isLeapJalaliYear`                                     |
| `jalaali.jalaaliMonthLength` | `jalaliMonthLength`                                    |

The numeric results are identical — Doran uses the same underlying algorithm.

## From `dayjs` (with a Jalali plugin)

`DoranDate.format` uses a familiar `dayjs`-style token vocabulary (`YYYY`, `MM`, `dddd`,
`HH`, `A`, …), so most format strings carry over directly. See the
[`@doranjs/core` API](/api/core) for the full token table.
