# Examples

Runnable reference integrations live in the
[`examples/`](https://github.com/amiralibg/Doran/tree/main/examples) directory of the repo:

- [`examples/react`](https://github.com/amiralibg/Doran/tree/main/examples/react) — a Vite + React playground using every component.
- [`examples/nextjs`](https://github.com/amiralibg/Doran/tree/main/examples/nextjs) — Next.js App Router usage (with `'use client'` boundaries).
- [`examples/tauri`](https://github.com/amiralibg/Doran/tree/main/examples/tauri) — a desktop app shell.

## Date math

```ts
import { DoranDate } from '@doran/core';

const start = DoranDate.fromJalali(1405, 1, 1);
const end = start.addMonths(3).endOf('month');

end.diff(start, 'day'); // number of days in Q1
start.isLeapYear(); // false
```

## Build a custom calendar (headless)

```tsx
import { buildMonthGrid } from '@doran/react';
import { faIR } from '@doran/core';

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
import { parse } from '@doran/nlp';

const result = parse('جمعه ساعت ۷ شب');
if (result && result.confidence > 0.8) {
  scheduleMeeting(result.date.toGregorian());
}
```

## Highlight holidays

```ts
import { getHolidays } from '@doran/holidays';

const official = getHolidays(1405).filter((h) => h.official);
```
