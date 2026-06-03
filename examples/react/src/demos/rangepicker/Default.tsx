import { faIR, type Locale } from '@doranjs/core';
import { DoranRangePicker, type DateRange } from '@doranjs/react';
import { useState } from 'react';

// Click a start day, then an end day. The hook manages the start/end handshake.
export default function Default({ locale = faIR }: { locale?: Locale }) {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return <DoranRangePicker value={range} onChange={setRange} locale={locale} />;
}
