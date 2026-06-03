import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/react';
import { useState } from 'react';

// `weekends` overrides which weekday indices are styled as weekend (0 = Saturday).
// The default is `[6]` (Friday); here we mark both Thursday and Friday.
export default function Weekends({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState(DoranDate.now());
  return <DoranCalendar value={value} onChange={setValue} weekends={[5, 6]} locale={locale} />;
}
