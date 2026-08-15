import { type Locale } from '@doranjs/core';
import { DoranRangeDatePicker, type DateRange } from '@doranjs/react';
import { useState } from 'react';

/**
 * One trigger holding two fields, either typable or fillable from the grid.
 *
 * The ends are kept in order: type or pick an end before the start and they swap,
 * rather than producing a backwards range. `numberOfMonths={2}` shows both months of
 * a typical stay at once.
 */
export default function WithTrigger({ locale }: { locale: Locale }) {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <DoranRangeDatePicker
        value={range}
        onChange={setRange}
        locale={locale}
        numberOfMonths={2}
        presets
        inputWidth="18rem"
      />
      <small style={{ fontSize: '0.78rem', color: 'var(--doran-text-muted)' }}>
        {range.start && range.end
          ? `${range.end.diff(range.start, 'day')} شب`
          : 'بازه‌ای انتخاب نشده'}
      </small>
    </div>
  );
}
