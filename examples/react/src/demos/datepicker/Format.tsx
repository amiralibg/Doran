import { type DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/react';
import { useState } from 'react';

// `format` controls how the selected date is displayed; `placeholder` is the
// empty-state hint. Starts empty here so the placeholder is visible.
export default function Format({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(null);
  return (
    <DoranDatePicker
      value={value}
      onChange={setValue}
      format="YYYY/MM/DD"
      placeholder="۱۴۰۳/۰۱/۰۱"
      locale={locale}
    />
  );
}
