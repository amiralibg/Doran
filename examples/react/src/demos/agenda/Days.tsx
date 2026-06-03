import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranAgenda, type AgendaEvent } from '@doranjs/react';

// `days` sets how many days to render — here a 3-day view starting today.
export default function Days({ locale = faIR }: { locale?: Locale }) {
  const start = DoranDate.now().startOf('day');
  const events: AgendaEvent[] = [
    { id: '1', date: start, title: 'امروز: تماس با مشتری', color: 'var(--doran-primary)' },
    { id: '2', date: start.addDays(2), title: 'پس‌فردا: انتشار گزارش' },
  ];
  return <DoranAgenda start={start} days={3} events={events} locale={locale} />;
}
