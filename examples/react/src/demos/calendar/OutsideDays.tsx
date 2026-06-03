import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/react';
import { useState } from 'react';

// `showOutsideDays` fills the leading/trailing cells with days from the adjacent
// months instead of leaving them blank. `hideFooter` drops the "today" button.
export default function OutsideDays({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState(DoranDate.now());
  return (
    <DoranCalendar value={value} onChange={setValue} showOutsideDays hideFooter locale={locale} />
  );
}
