# تست با دوران

هر چیزی که «اکنون» را می‌خواند — `DoranDate.now()`، `today`، `isToday`، `fromNow`،
`isBetween(now)` — وقتی کلاک مدام پیش می‌رود سخت قابل تست است. دوران یک کلاک قابل‌فریز
دارد تا «اکنون» را **بدون دستکاری `Date` سراسری** ثابت کنید (نه `MockDate`، نه نیاز به
`jest.useFakeTimers()`).

## `freeze` — فریز کلاک برای یک بلوک

```ts
import { DoranDate, freeze } from '@doranjs/core';

freeze(DoranDate.fromJalali(1405, 1, 1), () => {
  DoranDate.now().format('YYYY/MM/DD'); // همیشه "۱۴۰۵/۰۱/۰۱"
  DoranDate.fromJalali(1405, 1, 1).isToday(); // true
});
// بیرون از بلوک، now() دوباره زمان واقعی است
```

`freeze` کلاک قبلی را خودکار بازمی‌گرداند — حتی اگر callback خطا پرتاب کند، و حتی اگر
`async` باشد (کلاک هنگام settle شدن promise بازگردانده می‌شود):

```ts
await freeze(fixed, async () => {
  await doSomethingThatReadsNow();
});
```

## `setNow` / `resetNow` — فریز کلاک برای کل suite

`setNow` یک لحظهٔ ثابت (`number` اپوک میلی‌ثانیه، `Date` یا `DoranDate`) یا یک تابع را
می‌پذیرد که در هر خواندن دوباره ارزیابی می‌شود (برای کلاکی قابل‌کنترل و پیش‌رونده).

### Vitest

```ts
import { afterEach, expect, it } from 'vitest';
import { DoranDate } from '@doranjs/core';

afterEach(() => DoranDate.resetNow());

it('بر اساس روز فریزشده سلام می‌کند', () => {
  DoranDate.setNow(DoranDate.fromJalali(1405, 1, 1));
  expect(DoranDate.now().format('dddd')).toBe('شنبه');
});

it('زمان را کنترل‌شده جلو می‌برد', () => {
  let clock = Date.UTC(2026, 0, 1);
  DoranDate.setNow(() => clock); // منبع تابعی — هر بار دوباره خوانده می‌شود
  const a = DoranDate.now();
  clock += 86_400_000; // ‎+۱ روز
  expect(DoranDate.now().diff(a, 'day')).toBe(1);
});
```

### Jest

```ts
import { DoranDate } from '@doranjs/core';

afterEach(() => DoranDate.resetNow());

test('fromNow قطعی است', () => {
  DoranDate.setNow(DoranDate.fromJalali(1405, 1, 1));
  expect(DoranDate.fromJalali(1405, 1, 1).addDays(-1).fromNow()).toBe('یک روز پیش');
});
```

::: tip همیشه ریست کنید
`DoranDate.resetNow()` را در `afterEach` صدا بزنید (یا از `freeze` استفاده کنید که خودکار
بازمی‌گرداند) تا کلاک فریزشده به تست بعدی نشت نکند.
:::
