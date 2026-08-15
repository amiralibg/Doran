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

/** A key to what the tones under each day mean. */
function ToneLegend() {
  return (
    <>
      <Swatch color="var(--doran-success)" label="ظرفیت خوب" />
      <Swatch color="var(--doran-danger)" label="رو به اتمام" />
    </>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
      <span
        aria-hidden
        style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}
      />
      {label}
    </span>
  );
}

/** Buttons that look like the rest of the app rather than raw browser chrome. */
function AsideButton({
  children,
  onClick,
  disabled,
}: {
  children: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        font: 'inherit',
        fontSize: '0.78rem',
        textAlign: 'start',
        whiteSpace: 'nowrap',
        padding: '0.35rem 0.55rem',
        borderRadius: 'var(--doran-radius-md)',
        border: '1px solid var(--doran-border)',
        background: 'var(--doran-surface)',
        color: disabled ? 'var(--doran-text-subtle)' : 'var(--doran-text)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
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
    <>
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--doran-text-muted)',
          padding: '0 0.15rem 0.15rem',
        }}
      >
        {locale.months[month - 1]} {locale.formatNumber(String(year))}
      </div>
      <AsideButton onClick={() => jump(1)}>ماه بعد</AsideButton>
      <AsideButton onClick={() => jump(3)}>۳ ماه بعد</AsideButton>
      <AsideButton onClick={goToToday} disabled={isThisMonth}>
        برگرد به امروز
      </AsideButton>
    </>
  );
}

/** A footer that reflects the current selection. */
function SelectionSummary() {
  const { selected, locale, clear } = useDoranCalendar();

  if (!selected) return <span>تاریخی انتخاب نشده</span>;

  return (
    <>
      <span>{selected.withLocale(locale).format('dddd D MMMM')}</span>
      <button
        type="button"
        onClick={clear}
        style={{
          font: 'inherit',
          fontSize: '0.75rem',
          padding: '0.15rem 0.4rem',
          borderRadius: 'var(--doran-radius-sm)',
          border: 'none',
          background: 'transparent',
          color: 'var(--doran-primary)',
          cursor: 'pointer',
        }}
      >
        حذف
      </button>
    </>
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
        text: `${locale.formatNumber(String(seats))} جا`,
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
