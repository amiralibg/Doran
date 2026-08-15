import { faIR, type Locale } from '@doranjs/core';
import { DoranTimePicker, type TimeValue } from '@doranjs/react';
import { useState } from 'react';

// Each unit steps independently. Every one defaults to 1; here the minutes jump in
// 15s while the hour still moves one at a time.
export default function Step({ locale = faIR }: { locale?: Locale }) {
  const [time, setTime] = useState<TimeValue>({ hour: 14, minute: 0 });
  return <DoranTimePicker value={time} onChange={setTime} minuteStep={15} locale={locale} />;
}
