import { faIR, type Locale } from '@doranjs/core';
import { DoranRangePicker, type DateRange } from '@doranjs/react';
import { useState } from 'react';

// `presets` adds shortcut buttons (last 7 days, this month, …) above the
// calendar. Pass `true` for the built-in set, or your own RangePreset[].
export default function Presets({ locale = faIR }: { locale?: Locale }) {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return <DoranRangePicker value={range} onChange={setRange} presets locale={locale} />;
}
