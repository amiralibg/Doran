import { faIR, type Locale } from '@doranjs/core';
import { DoranRangePicker, type DateRange } from '@doranjs/react';
import { useState } from 'react';

// `numberOfMonths` renders several months side by side, easing the selection of
// longer ranges.
export default function MultiMonth({ locale = faIR }: { locale?: Locale }) {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return <DoranRangePicker value={range} onChange={setRange} numberOfMonths={2} locale={locale} />;
}
