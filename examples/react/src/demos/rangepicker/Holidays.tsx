import { type DoranDate, faIR, type Locale } from '@doranjs/core';
import { getHolidaysOn } from '@doranjs/holidays';
import { DoranRangePicker, type DateRange } from '@doranjs/react';
import { useCallback, useState } from 'react';

// The same holiday/weekend marking as the calendar — `isHoliday` and `weekends`
// carry straight over to the range picker.
export default function Holidays({ locale = faIR }: { locale?: Locale }) {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const isHoliday = useCallback((day: DoranDate) => getHolidaysOn(day).some((h) => h.official), []);
  return (
    <DoranRangePicker
      value={range}
      onChange={setRange}
      isHoliday={isHoliday}
      weekends={[5, 6]}
      locale={locale}
    />
  );
}
