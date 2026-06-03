import { DoranDate } from '@doranjs/core';
import type { AgendaEvent, DoranAgendaElement } from '@doranjs/wc';

// One week starting Saturday, each day with its events. `start` and `events` are
// set as JS properties (not attributes).
export default function Default(locale: string): HTMLElement {
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

  const agenda = document.createElement('doran-agenda') as DoranAgendaElement;
  agenda.setAttribute('locale', locale);
  agenda.start = weekStart;
  agenda.events = events;
  return agenda;
}
