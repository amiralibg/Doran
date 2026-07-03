# Examples

## Live demos

Try the components right in your browser — these deploy alongside these docs:

- **[React demo →](https://amiralibg.github.io/Doran/examples/react/)** — every component, theming, pickers, and NLP input.
- **[Vue demo →](https://amiralibg.github.io/Doran/examples/vue/)** — the same catalog with `@doranjs/vue` (`v-model`).
- **[Svelte demo →](https://amiralibg.github.io/Doran/examples/svelte/)** — the same catalog with `@doranjs/svelte` (`bind:value`).
- **[Angular demo →](https://amiralibg.github.io/Doran/examples/angular/)** — the same catalog with `@doranjs/angular` (`ControlValueAccessor`).
- **[Vanilla / Web Components demo →](https://amiralibg.github.io/Doran/examples/vanilla/)** — the same UI in plain HTML, no framework.

## Source

Runnable reference integrations live in the
[`examples/`](https://github.com/amiralibg/Doran/tree/main/examples) directory of the repo:

- [`examples/react`](https://github.com/amiralibg/Doran/tree/main/examples/react) — a Vite + React playground using every component.
- [`examples/vanilla`](https://github.com/amiralibg/Doran/tree/main/examples/vanilla) — `@doranjs/wc` custom elements in plain HTML.
- [`examples/nextjs`](https://github.com/amiralibg/Doran/tree/main/examples/nextjs) — Next.js App Router usage (with `'use client'` boundaries).
- [`examples/tauri`](https://github.com/amiralibg/Doran/tree/main/examples/tauri) — a desktop app shell.

## Date math

```ts
import { DoranDate } from '@doranjs/core';

const start = DoranDate.fromJalali(1405, 1, 1);
const end = start.addMonths(3).endOf('month');

end.diff(start, 'day'); // number of days in Q1
start.isLeapYear(); // false
```

## Build a custom calendar (headless)

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

## Natural language → calendar

```ts
import { parse } from '@doranjs/nlp';

const result = parse('جمعه ساعت ۷ شب');
if (result && result.confidence > 0.8) {
  scheduleMeeting(result.date.toGregorian());
}
```

## Highlight holidays

```ts
import { getHolidays } from '@doranjs/holidays';

const official = getHolidays(1405).filter((h) => h.official);
```

## Form validation with zod

`zDoranDate()` coerces any date input (ISO string, `Date`, epoch, or `DoranDate`) into a
`DoranDate` and drops into any zod-based form stack. See [`@doranjs/zod`](/en/api/zod) for details.

```ts
import { z } from 'zod';
import { zDoranDate } from '@doranjs/zod';

const Booking = z.object({
  checkIn: zDoranDate({ min: '2024-01-01' }),
  checkOut: zDoranDate(),
});

const { checkIn } = Booking.parse({ checkIn: '2024-06-28', checkOut: new Date() });
checkIn.toISOString(); // Gregorian ISO for your backend
```
