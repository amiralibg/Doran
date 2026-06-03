import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { getHolidaysOn } from '@doranjs/holidays';
import { DoranCalendar } from '@doranjs/react';
import { useCallback, useState } from 'react';

// `isHoliday` marks days with a dot and the holiday color. Here it's wired to
// the official-holiday data from @doranjs/holidays.
export default function Holidays({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState(DoranDate.now());
  const isHoliday = useCallback((day: DoranDate) => getHolidaysOn(day).some((h) => h.official), []);
  return <DoranCalendar value={value} onChange={setValue} isHoliday={isHoliday} locale={locale} />;
}
