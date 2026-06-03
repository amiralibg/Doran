import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/react';
import { useState } from 'react';

// The default calendar: dropdown month/year header, Saturday-first weeks, RTL.
export default function Default({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState(DoranDate.now());
  return (
    <>
      <DoranCalendar value={value} onChange={setValue} locale={locale} />
      <p className="result">{value.withLocale(locale).format('dddd D MMMM YYYY')}</p>
    </>
  );
}
