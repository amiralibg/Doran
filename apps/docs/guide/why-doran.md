# چرا دوران

هستهٔ دوران یک موتور جلالیِ **بدون وابستگی (zero-dependency)**، تغییرناپذیر و
tree-shakeable است که **timezoneهای IANA را به‌صورت داخلی** دارد. در برابر پشتهٔ
رایج — `moment` + `moment-jalaali` — این یعنی bundle بسیار کوچک‌تر و مسیرهای داغِ
سریع‌تر، بدون نیاز به کتابخانهٔ دوم برای timezone.

## اندازهٔ bundle

با همان pipeline اندازه‌گیری شده (esbuild `--minify` سپس gzip) تا اعداد قابل‌مقایسه
باشند — نه برگرفته از منابع مختلف.

| پیکربندی                                 | Minified | Gzipped |
| ---------------------------------------- | -------: | ------: |
| `moment` + `moment-jalaali`              |  85.5 kB | 25.1 kB |
| `dayjs` + `jalaliday`                    |  16.0 kB |  6.2 kB |
| **`@doranjs/core`** (بارلِ کامل)         |  23.5 kB |  7.9 kB |
| `@doranjs/core` — `DoranDate` + `format` |  19.1 kB |  6.3 kB |
| `@doranjs/core` — فقط primitiveهای تبدیل |   4.6 kB |  1.8 kB |
| `@doranjs/core` — فقط `Duration`         |   5.3 kB |  1.8 kB |

دوران تقریباً **۳ برابر کوچک‌تر (gzip) از `moment` + `moment-jalaali`** است — یک
مهاجرت واقعی با حذف moment حدود ۶۳ کیلوبایت از bundle یک اپ کم کرد. هم‌رده با
`dayjs` + یک پلاگین جلالی است، اما **بدون وابستگی**، با **timezoneهای IANA داخلی**
(بدون `moment-timezone`)، تغییرناپذیر، و جلالی به‌عنوان تقویم درجه‌یک نه یک پلاگین.

### Tree-shaking

`@doranjs/core` دارای `"sideEffects": false` و کاملاً ESM است، پس bundler هرچه را
import نکنید حذف می‌کند. فقط آنچه استفاده می‌کنید را بیاورید:

```ts
// فقط ریاضیات تقویم — حدود ۱.۸ کیلوبایت gzip، بدون formatter و parser.
import { jalaliToGregorian, gregorianToJalali } from '@doranjs/core';
```

named export را import کنید (نه `import * as`) و باقی را به bundler بسپارید.

## کارایی

عملیات بر ثانیه، بیشتر بهتر است. `@doranjs/core` در برابر `moment` +
`moment-jalaali`، Node 20، هر دو روی یک timezone ثابت برای مقایسهٔ منصفانه
(moment-jalaali به‌صورت پیش‌فرض timezone-aware نیست).

| عملیات       | @doranjs/core | moment + moment-jalaali | سرعت |
| ------------ | ------------: | ----------------------: | ---: |
| `format`     |      ~315,000 |                ~289,000 | 1.1× |
| `parse`      |      ~210,000 |                ~128,000 | 1.7× |
| `construct`  |      ~250,000 |                ~127,000 | 2.0× |
| `diff` (روز) |   ~38,000,000 |              ~2,200,000 |  17× |

اجرای محلی:

```sh
pnpm --filter @doranjs/core build
node packages/core/bench/index.mjs
```

::: tip timezone را دوباره استفاده کنید
ساختن با `{ timeZone }` صریح (یا یک‌بار پیش‌فرض سیستم) به دوران اجازه می‌دهد
`Intl.DateTimeFormat` زیرین را cache کند. تنها چیزی که ساختن را محسوس کند می‌کند،
resolve دوبارهٔ timezone سیستم در هر فراخوانی است.
:::

## فراتر از اعداد

- **بدون وابستگی runtime** — چیزی برای audit یا CVE نیست.
- **timezone داخلی** — تبدیل IANA با DST درست، بدون پکیج دوم.
- **تغییرناپذیر** — هر عملیات یک نمونهٔ تازه برمی‌گرداند؛ بدون mutation تصادفی.
- **یک لحظه، دو تقویم** — `toISOString()` برای backend، `format()` برای نمایش
  جلالی. [Backendها و سریال‌سازی](/guide/backends) را ببینید.
- **TypeScript-native**، با واژگان token آشنای `dayjs`/`moment`.

CI با یک بودجهٔ gzip (`scripts/size-check.mjs`) از bundle منتشرشده محافظت می‌کند تا
این اعداد با رشد کتابخانه صادق بمانند.
