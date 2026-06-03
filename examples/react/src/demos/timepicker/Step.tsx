import { faIR, type Locale } from '@doranjs/core';
import { DoranTimePicker, type TimeValue } from '@doranjs/react';
import { useState } from 'react';

// `minuteStep` sets the minute increment — here the minutes jump in 15s.
export default function Step({ locale = faIR }: { locale?: Locale }) {
  const [time, setTime] = useState<TimeValue>({ hour: 14, minute: 0 });
  return <DoranTimePicker value={time} onChange={setTime} minuteStep={15} locale={locale} />;
}
