import { DoranDate, dayKey, type DayDataMap, type Locale } from '@doranjs/core';
import { DoranCalendar, useDoranCalendar } from '@doranjs/react';
import { useMemo, useState } from 'react';

/**
 * Custom content in the `legend`, `aside`, and `footer` regions.
 *
 * The sidebar widget reads and drives the calendar through `useDoranCalendar()` —
 * which is what separates a slot system from decoration. Unlike `dayContent`, slot
 * content sits outside the day grid, so it may be fully interactive.
 */

/** A legend explaining what the tones under each day mean. */
function ToneLegend() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem' }}>
      <span style={{ color: 'var(--doran-success)' }}>● ظرفیت خوب</span>
      <span style={{ color: 'var(--doran-danger)' }}>● رو به اتمام</span>
    </div>
  );
}

/** A sidebar that jumps the visible month — driven entirely by the context hook. */
function MonthJumper() {
  const { year, month, today, setMonth, goToToday, locale } = useDoranCalendar();

  const jump = (delta: number) => {
    const total = year * 12 + (month - 1) + delta;
    setMonth({ year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 });
  };

  const isThisMonth = year === today.year && month === today.month;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '7rem' }}>
      <strong style={{ fontSize: '0.75rem' }}>
        {locale.months[month - 1]} {locale.formatNumber(String(year))}
      </strong>
      <button type="button" onClick={() => jump(1)}>
        ماه بعد
      </button>
      <button type="button" onClick={() => jump(3)}>
        ۳ ماه بعد
      </button>
      <button type="button" onClick={goToToday} disabled={isThisMonth}>
        برگرد به امروز
      </button>
    </div>
  );
}

/** A footer that reflects the current selection. */
function SelectionSummary() {
  const { selected, locale, clear } = useDoranCalendar();
  if (!selected) return <span style={{ fontSize: '0.78rem' }}>تاریخی انتخاب نشده</span>;
  return (
    <span style={{ fontSize: '0.78rem' }}>
      انتخاب شده: {selected.withLocale(locale).format('dddd D MMMM')}{' '}
      <button type="button" onClick={clear}>
        حذف
      </button>
    </span>
  );
}

export default function LegendAside({ locale }: { locale: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(null);
  const today = useMemo(() => DoranDate.now().startOf('day'), []);

  const dayData = useMemo<DayDataMap>(() => {
    const data: DayDataMap = {};
    for (let offset = 0; offset < 45; offset += 1) {
      const day = today.addDays(offset);
      const seats = (offset * 5) % 12;
      data[dayKey(day)] = {
        text: locale.formatNumber(String(seats)),
        tone: seats <= 3 ? 'high' : 'low',
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
      footerActions={[]}
      slots={{
        legend: <ToneLegend />,
        aside: <MonthJumper />,
        footer: <SelectionSummary />,
      }}
    />
  );
}
