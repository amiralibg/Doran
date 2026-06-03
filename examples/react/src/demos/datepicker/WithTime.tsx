import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/react';
import { useState } from 'react';

// `withTime` adds a time picker to the popover and a custom display `format`
// shows the time alongside the date.
export default function WithTime({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(DoranDate.now());
  return (
    <DoranDatePicker
      value={value}
      onChange={setValue}
      withTime
      minuteStep={5}
      format="dddd D MMMM YYYY — HH:mm"
      locale={locale}
    />
  );
}
