import { DoranDate, dayKey, type DayDataMap, type Locale } from '@doranjs/core';
import { DoranRangePicker, type DateRange } from '@doranjs/react';
import { useMemo, useState } from 'react';

/**
 * Rooms remaining under each night, with fully-booked dates blocked.
 *
 * The blocked days carry a `disabledReason`, so they are not merely dimmed: the
 * reason becomes a tooltip *and* joins the day's accessible name, and the day stays
 * keyboard-focusable so a screen-reader user can hear it.
 */
export default function HotelAvailability({ locale }: { locale: Locale }) {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const today = useMemo(() => DoranDate.now().startOf('day'), []);

  const dayData = useMemo<DayDataMap>(() => {
    const data: DayDataMap = {};
    for (let offset = 0; offset < 60; offset += 1) {
      const day = today.addDays(offset);
      const rooms = (offset * 7) % 9;
      data[dayKey(day)] =
        rooms === 0
          ? { disabled: true, disabledReason: 'تکمیل ظرفیت' }
          : {
              // Just the count: at two-month width there is no room for a unit word.
              text: locale.formatNumber(String(rooms)),
              tone: rooms <= 2 ? 'high' : 'low',
            };
    }
    return data;
  }, [today, locale]);

  return (
    <DoranRangePicker
      value={range}
      onChange={setRange}
      locale={locale}
      numberOfMonths={2}
      dayData={dayData}
      slots={{
        legend: (
          <>
            <span>عدد زیر هر روز، اتاق‌های باقی‌مانده است</span>
          </>
        ),
      }}
    />
  );
}
