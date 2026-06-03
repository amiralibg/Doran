import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/react';
import { useState } from 'react';

// `min`/`max` bound the selectable range (here ±10 days around today). A second,
// `disabled` input shows the read-only state.
export default function MinMax({ locale = faIR }: { locale?: Locale }) {
  const today = DoranDate.now();
  const [value, setValue] = useState<DoranDate | null>(today);
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <DoranDatePicker
        value={value}
        onChange={setValue}
        min={today.addDays(-10)}
        max={today.addDays(10)}
        locale={locale}
      />
      <DoranDatePicker value={today} disabled locale={locale} />
    </div>
  );
}
