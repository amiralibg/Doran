import { faIR, type Locale } from '@doranjs/core';
import { DoranTimePicker, type TimeValue } from '@doranjs/react';
import { useState } from 'react';

// A standalone hour/minute picker. `value` is a { hour, minute } object.
export default function Default({ locale = faIR }: { locale?: Locale }) {
  const [time, setTime] = useState<TimeValue>({ hour: 9, minute: 30 });
  return <DoranTimePicker value={time} onChange={setTime} locale={locale} />;
}
