# شروع به کار

دوران یک monorepo از بسته‌های متمرکز TypeScript برای تقویم فارسی (جلالی) است.
فقط آنچه را نیاز دارید نصب کنید — هر بسته مستقل و tree-shakeable است.

## مدل ذهنی: یک لحظه، دو تقویم

این بخش را اول بخوانید — رایج‌ترین (و پرهزینه‌ترین) اشتباه را خنثی می‌کند.

یک `DoranDate` یک **لحظهٔ** واحد در زمان است. همان لحظه را می‌توان به دو شکل _نمایش_ داد:

- **جلالی** برای کاربران شما — `format(...)`
- **میلادی** برای backend شما — `formatGregorian(...)`، `toISOString()`

> یک لحظه، دو نما. `format` چیزی است که یک انسان می‌خواند؛ `toISOString()` چیزی است که یک
> سرور ذخیره می‌کند. هر دو _یک لحظهٔ یکسان_ را توصیف می‌کنند — تاریخ‌های متفاوت نیستند.

```ts
const d = DoranDate.now();

d.format('YYYY/MM/DD'); // "۱۴۰۵/۰۳/۱۱"  → این را به کاربر نشان دهید
d.toISOString(); // "2026-06-01T08:00:00.000Z"  → این را به سرور بفرستید
```

⚠️ `toISOString()` خروجی **میلادی UTC** است — برای ارسال به هر backend امن است. مقدار
`toJalaliISO()` را به API خود **نفرستید**. برای دستور کامل و رفت‌وبرگشت،
[Backendها و سریال‌سازی](/guide/backends) را ببینید.

## نصب

::: code-group

```bash [pnpm]
pnpm add @doranjs/core
```

```bash [npm]
npm install @doranjs/core
```

```bash [yarn]
yarn add @doranjs/core
```

:::

سایر بسته‌ها بر پایهٔ core ساخته شده‌اند:

```bash
pnpm add @doranjs/nlp @doranjs/holidays              # منطق
pnpm add @doranjs/react @doranjs/ui react react-dom  # React UI
pnpm add @doranjs/vue                                # Vue 3
pnpm add @doranjs/svelte                             # Svelte 4/5
pnpm add @doranjs/angular @angular/forms             # Angular (standalone)
pnpm add @doranjs/wc                                 # Web Components (هر framework / HTML ساده)
pnpm add @doranjs/zod zod                            # اعتبارسنجی فرم‌ها
```

هر چهار بایندینگِ فریم‌ورک روی همان موتورِ مشترک سوارند و قرارداد یکسانی دارند —
[بایندینگ‌های فریم‌ورک](/guide/frameworks) را برای مقایسهٔ کنار هم ببینید.

## نخستین تاریخ شما

```ts
import { DoranDate } from '@doranjs/core';

const today = DoranDate.now();

today.year; // 1405
today.format('YYYY/MM/DD'); // "۱۴۰۵/۰۳/۱۱"
today.addDays(10).format('dddd D MMMM YYYY'); // "..."
```

`DoranDate` **immutable** است — هر متد `add*` / `with*` یک instance تازه برمی‌گرداند.

## تبدیل به/از میلادی

```ts
DoranDate.fromGregorian(new Date()); // از یک Date نیتیو
DoranDate.fromJalali(1405, 3, 11); // از فیلدهای جلالی
DoranDate.now().toGregorian(); // بازگشت به یک Date نیتیو
```

## Time zone و Locale

یک `DoranDate` یک instant مطلق به‌علاوهٔ یک IANA time zone است، پس تبدیل‌ها دقیق‌اند.

```ts
const tehran = DoranDate.fromJalali(1405, 3, 11, { timeZone: 'Asia/Tehran' });
tehran.withTimeZone('UTC'); // همان instant، wall-clock متفاوت
tehran.withLocale('en-US').format('dddd D MMMM YYYY'); // خروجی لاتین
```

## Parse کردن زبان طبیعی

```ts
import { parse } from '@doranjs/nlp';

parse('جمعه ساعت ۷ شب'); // { date: DoranDate, confidence: 0.98, matched: '...' }
parse('farda'); // Finglish هم کار می‌کند → فردا
parse('tvnh'); // حتی متنی که با layout انگلیسیِ کیبورد تایپ شده → فردا
```

عبارت‌های پشتیبانی‌شده طیف گسترده‌ای دارند — روزهای نسبی، روزهای هفته، تاریخ‌های صریح،
anchorهای ماه (`اواخر اسفند`)، روزهای خاص، rangeها، durationها و قواعد recurrence.
فهرست کامل را در reference بستهٔ [`@doranjs/nlp`](/api/nlp) ببینید.

## استفاده در HTML ساده (Web Components)

بدون نیاز به bundler یا framework — بسته را import کنید (که elementها را register می‌کند) و
stylesheet را بیفزایید:

```html
<link rel="stylesheet" href="https://unpkg.com/@doranjs/wc/dist/styles.css" />
<script src="https://unpkg.com/@doranjs/wc/dist/doran.global.js"></script>

<doran-calendar show-holidays></doran-calendar>
<doran-datepicker with-time></doran-datepicker>
<doran-nlp-input></doran-nlp-input>
```

برای همهٔ elementها، attributeها و eventها [`@doranjs/wc`](/api/wc) را ببینید.

## گام‌های بعدی

- مرور [معماری](/guide/architecture) را بخوانید.
- [API Reference](/api/core) را مرور کنید.
- [نمونه‌ها](/examples) را به‌طور کامل ببینید.
