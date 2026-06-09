# راهنمای مهاجرت

مهاجرت به دوران از یک کتابخانهٔ دیگرِ تاریخ فارسی معمولاً تغییری کوچک و مکانیکی است.

## از `moment-jalaali`

| `moment-jalaali`                     | دوران (`@doranjs/core`)         |
| ------------------------------------ | ------------------------------- |
| `moment()`                           | `DoranDate.now()`               |
| `moment(date)`                       | `DoranDate.fromGregorian(date)` |
| `m.jYear()` / `jMonth()` / `jDate()` | `d.year` / `d.month` / `d.day`  |
| `m.add(1, 'jMonth')`                 | `d.addMonths(1)`                |
| `m.format('jYYYY/jMM/jDD')`          | `d.format('YYYY/MM/DD')`        |
| `m.toDate()`                         | `d.toGregorian()`               |

تفاوت‌های کلیدی:

- دوران **immutable** است — `d.addMonths(1)` یک مقدار تازه برمی‌گرداند؛ `d` را mutate نمی‌کند.
- در format tokenها پیشوند `j` وجود ندارد؛ tokenها همیشه در تقویم جلالی تفسیر می‌شوند.
- ماه‌ها **۱-based** هستند (`1` = فروردین)، برخلاف `jMonth()` که در Moment صفر-based است.

## از `jalaali-js`

`jalaali-js` توابع conversion خام را عرضه می‌کند. دوران همان primitiveها به‌علاوهٔ یک
`DoranDate` کامل را ارائه می‌دهد:

| `jalaali-js`                 | دوران                                                  |
| ---------------------------- | ------------------------------------------------------ |
| `jalaali.toJalaali(g)`       | `gregorianToJalali(y, m, d)`                           |
| `jalaali.toGregorian(j)`     | `jalaaliToGregorian(jy, jm, jd)` (`jalaliToGregorian`) |
| `jalaali.isLeapJalaaliYear`  | `isLeapJalaliYear`                                     |
| `jalaali.jalaaliMonthLength` | `jalaliMonthLength`                                    |

نتایج عددی یکسان‌اند — دوران از همان الگوریتم زیرین استفاده می‌کند.

## از `dayjs` (با plugin جلالی)

`DoranDate.format` از همان واژگان tokenِ آشنای `dayjs` استفاده می‌کند (`YYYY`، `MM`، `dddd`،
`HH`، `A`، …)، پس بیشتر format stringها مستقیماً منتقل می‌شوند. برای جدول کامل tokenها
[API بستهٔ `@doranjs/core`](/en/api/core) را ببینید.
