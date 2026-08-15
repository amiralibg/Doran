import { DoranDate, dayKey, type DayDataMap, type Locale } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/react';
import { useMemo, useState } from 'react';

/**
 * Meeting counts under each day.
 *
 * This uses `dayData` rather than `dayContent`: it is a plain serializable object,
 * so it can come straight from an API response — and the same shape works in Vue,
 * Svelte, Angular, and plain HTML via `<doran-calendar>`.
 */
export default function EventDots({ locale }: { locale: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(null);
  const today = useMemo(() => DoranDate.now().startOf('day'), []);

  const dayData = useMemo<DayDataMap>(() => {
    const data: DayDataMap = {};
    for (const [offset, count] of [
      [-3, 1],
      [1, 2],
      [2, 5],
      [4, 1],
      [8, 3],
      [9, 7],
      [15, 2],
    ] as const) {
      const day = today.addDays(offset);
      data[dayKey(day)] = {
        // A bare count reads better in a 7-column grid than "N جلسه" does.
        text: locale.formatNumber(String(count)),
        // Busy days read as a warning; quiet ones stay neutral.
        tone: count >= 5 ? 'high' : 'neutral',
      };
    }
    return data;
  }, [today, locale]);

  return (
    <DoranCalendar
      value={value}
      onChange={setValue}
      locale={locale}
      dayData={dayData}
      slots={{ legend: <span>عدد زیر هر روز، تعداد جلسه‌های آن روز است</span> }}
    />
  );
}
