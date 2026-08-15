import { type DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/react';
import { useState } from 'react';

// `format` controls how the selected date is displayed — and how typing is masked:
// digits flow into this shape as they are entered, so here `14030101` becomes
// `1403-01-01`. `placeholder` is the empty-state hint; the field starts empty so
// it is visible.
export default function Format({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(null);
  return (
    <DoranDatePicker
      value={value}
      onChange={setValue}
      format="YYYY-MM-DD"
      placeholder="۱۴۰۳-۰۱-۰۱"
      locale={locale}
    />
  );
}
