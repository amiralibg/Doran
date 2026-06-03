import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranAgenda, type AgendaEvent } from '@doranjs/react';

// One week of days starting Saturday, each with its events. `start` is the first
// day; `events` are placed on their `date`.
export default function Default({ locale = faIR }: { locale?: Locale }) {
  const weekStart = DoranDate.now().startOf('week');
  const events: AgendaEvent[] = [
    {
      id: '1',
      date: weekStart.addDays(1),
      title: 'جلسهٔ هفتگی تیم',
      color: 'var(--doran-primary)',
    },
    { id: '2', date: weekStart.addDays(1), title: 'بازبینی کد' },
    {
      id: '3',
      date: weekStart.addDays(3),
      title: 'تحویل نسخهٔ جدید',
      color: 'var(--doran-accent)',
    },
  ];
  return <DoranAgenda start={weekStart} events={events} locale={locale} />;
}
