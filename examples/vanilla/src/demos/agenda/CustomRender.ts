import { DoranDate } from '@doranjs/core';
import type { AgendaEvent, DoranAgendaElement } from '@doranjs/wc';

// `renderEvent` returns an HTML string for each event — here a colored pill.
export default function CustomRender(locale: string): HTMLElement {
  const start = DoranDate.now().startOf('day');
  const events: AgendaEvent[] = [
    { id: '1', date: start, title: 'طراحی', color: '#6366f1' },
    { id: '2', date: start.addDays(1), title: 'توسعه', color: '#10b981' },
  ];

  const agenda = document.createElement('doran-agenda') as DoranAgendaElement;
  agenda.setAttribute('locale', locale);
  agenda.setAttribute('days', '3');
  agenda.start = start;
  agenda.events = events;
  agenda.renderEvent = (event) =>
    `<span style="display:inline-block;padding:0.15rem 0.6rem;border-radius:999px;background:${event.color};color:#fff;font-size:0.8rem">${event.title}</span>`;
  return agenda;
}
