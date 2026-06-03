import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranMonthView, useCalendar } from '@doranjs/react';
import { useState } from 'react';

// For full control, skip <DoranCalendar> and compose the headless `useCalendar`
// hook with the presentational <DoranMonthView>. Here we drive navigation with
// our own buttons and render the same accessible grid.
export default function Headless({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(DoranDate.now());
  const cal = useCalendar({ value, onChange: setValue });

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button type="button" onClick={cal.goToPrevMonth}>
          ‹
        </button>
        <strong style={{ flex: 1, textAlign: 'center' }}>
          {DoranDate.fromJalali(cal.year, cal.month, 1).withLocale(locale).format('MMMM YYYY')}
        </strong>
        <button type="button" onClick={cal.goToNextMonth}>
          ›
        </button>
      </div>
      <DoranMonthView
        grid={cal.grid}
        locale={locale}
        onSelect={cal.select}
        onMonthChange={cal.setMonth}
        isSelected={cal.isSelected}
        isDisabled={cal.isDisabled}
      />
    </div>
  );
}
