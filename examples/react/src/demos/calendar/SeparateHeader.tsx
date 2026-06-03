import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/react';
import { useState } from 'react';

// `headerMode="separate"` renders native month and year <select>s instead of
// the in-place dropdown panels.
export default function SeparateHeader({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState(DoranDate.now());
  return <DoranCalendar value={value} onChange={setValue} headerMode="separate" locale={locale} />;
}
