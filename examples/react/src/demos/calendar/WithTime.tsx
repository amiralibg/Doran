import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/react';
import { useState } from 'react';

// `withTime` adds a time picker and carries the time-of-day on the selected
// value. `minuteStep` controls the minute increment.
export default function WithTime({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState(DoranDate.now());
  return (
    <>
      <DoranCalendar
        value={value}
        onChange={setValue}
        withTime
        minuteStep={5}
        defaultTime={{ hour: 9, minute: 0 }}
        locale={locale}
      />
      <p className="result">{value.withLocale(locale).format('dddd D MMMM YYYY — HH:mm')}</p>
    </>
  );
}
