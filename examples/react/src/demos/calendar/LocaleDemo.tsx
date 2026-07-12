import { DoranDate, enUS } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/react';
import { useState } from 'react';

// The `locale` prop switches the calendar's language. Passing the built-in
// `enUS` renders English month/weekday names, Latin digits, and localized
// footer actions — the same component, a different locale.
export default function LocaleDemo() {
  const [value, setValue] = useState(DoranDate.now());
  return (
    <>
      <DoranCalendar value={value} onChange={setValue} locale={enUS} />
      <p className="result">{value.withLocale(enUS).format('dddd D MMMM YYYY')}</p>
    </>
  );
}
