# نمونه‌ها

## دموهای live

کامپوننت‌ها را همین‌جا در مرورگرتان امتحان کنید — این‌ها در کنار همین مستندات deploy می‌شوند:

- **[دموی React ←](https://amiralibg.github.io/Doran/examples/react/)** — همهٔ کامپوننت‌ها، theming، pickerها و NLP input.
- **[دموی Vue ←](https://amiralibg.github.io/Doran/examples/vue/)** — همان کاتالوگ با `@doranjs/vue` (‏`v-model`).
- **[دموی Svelte ←](https://amiralibg.github.io/Doran/examples/svelte/)** — همان کاتالوگ با `@doranjs/svelte` (‏`bind:value`).
- **[دموی Angular ←](https://amiralibg.github.io/Doran/examples/angular/)** — همان کاتالوگ با `@doranjs/angular` (‏`ControlValueAccessor`).
- **[دموی Vanilla / Web Components ←](https://amiralibg.github.io/Doran/examples/vanilla/)** — همان UI در HTML ساده، بدون framework.

## کد منبع

نمونه‌های مرجعِ قابل‌اجرا در پوشهٔ
[`examples/`](https://github.com/amiralibg/Doran/tree/main/examples) مخزن قرار دارند:

- [`examples/react`](https://github.com/amiralibg/Doran/tree/main/examples/react) — یک playground مبتنی بر Vite + React که از همهٔ کامپوننت‌ها استفاده می‌کند.
- [`examples/vanilla`](https://github.com/amiralibg/Doran/tree/main/examples/vanilla) — custom elementهای `@doranjs/wc` در HTML ساده.
- [`examples/nextjs`](https://github.com/amiralibg/Doran/tree/main/examples/nextjs) — استفاده با App Router نکست‌جی‌اس (با boundaryهای `'use client'`).
- [`examples/tauri`](https://github.com/amiralibg/Doran/tree/main/examples/tauri) — shell یک اپلیکیشن desktop.

## محاسبات تاریخ

```ts
import { DoranDate } from '@doranjs/core';

const start = DoranDate.fromJalali(1405, 1, 1);
const end = start.addMonths(3).endOf('month');

end.diff(start, 'day'); // تعداد روزهای سه‌ماههٔ اول
start.isLeapYear(); // false
```

## ساخت تقویم سفارشی (headless)

```tsx
import { buildMonthGrid } from '@doranjs/react';
import { faIR } from '@doranjs/core';

function MiniMonth({ year, month }: { year: number; month: number }) {
  const grid = buildMonthGrid(year, month);
  return (
    <table dir="rtl">
      <thead>
        <tr>
          {faIR.weekdaysMin.map((w) => (
            <th key={w}>{w}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {grid.weeks.map((week, i) => (
          <tr key={i}>
            {week.map((cell) => (
              <td key={cell.date.epochMs} style={{ opacity: cell.inCurrentMonth ? 1 : 0.4 }}>
                {cell.date.format('D')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## زبان طبیعی ← تقویم

```ts
import { parse } from '@doranjs/nlp';

const result = parse('جمعه ساعت ۷ شب');
if (result && result.confidence > 0.8) {
  scheduleMeeting(result.date.toGregorian());
}
```

## برجسته‌سازی تعطیلات

```ts
import { getHolidays } from '@doranjs/holidays';

const official = getHolidays(1405).filter((h) => h.official);
```

## اعتبارسنجی فرم با zod

`zDoranDate()` هر ورودیِ تاریخ (رشتهٔ ISO، `Date`، epoch یا `DoranDate`) را به یک `DoranDate`
coerce می‌کند و داخلِ هر stackِ فرمِ مبتنی بر zod می‌افتد. جزئیات در [`@doranjs/zod`](/api/zod).

```ts
import { z } from 'zod';
import { zDoranDate } from '@doranjs/zod';

const Booking = z.object({
  checkIn: zDoranDate({ min: '2024-01-01' }),
  checkOut: zDoranDate(),
});

const { checkIn } = Booking.parse({ checkIn: '2024-06-28', checkOut: new Date() });
checkIn.toISOString(); // میلادیِ ISO برای backend
```
