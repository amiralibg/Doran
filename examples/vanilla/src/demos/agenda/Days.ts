import { DoranDate } from '@doranjs/core';
import type { AgendaEvent, DoranAgendaElement } from '@doranjs/wc';

// `days` sets how many days to render — here a 3-day view starting today.
export default function Days(locale: string): HTMLElement {
  const start = DoranDate.now().startOf('day');
  const events: AgendaEvent[] = [
    { id: '1', date: start, title: 'امروز: تماس با مشتری', color: 'var(--doran-primary)' },
    { id: '2', date: start.addDays(2), title: 'پس‌فردا: انتشار گزارش' },
  ];

  const agenda = document.createElement('doran-agenda') as DoranAgendaElement;
  agenda.setAttribute('locale', locale);
  agenda.setAttribute('days', '3');
  agenda.start = start;
  agenda.events = events;
  return agenda;
}
