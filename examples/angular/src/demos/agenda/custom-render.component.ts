import { Component, input } from '@angular/core';
import { DoranDate } from '@doranjs/core';
import { DoranAgenda } from '@doranjs/angular';
import { type AgendaEvent } from '@doranjs/wc';

// renderEvent takes over the markup for each event, returning an HTML string —
// here a colored pill with the title.
@Component({
  selector: 'demo-ag-custom-render',
  standalone: true,
  imports: [DoranAgenda],
  template: `
    <dr-agenda
      [start]="start"
      [days]="3"
      [events]="events"
      [renderEvent]="renderEvent"
      [locale]="lang()"
    />
  `,
})
export class AgCustomRender {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly start = DoranDate.now().startOf('day');
  readonly events: AgendaEvent[] = [
    { id: '1', date: this.start, title: 'طراحی', color: '#6366f1' },
    { id: '2', date: this.start.addDays(1), title: 'توسعه', color: '#10b981' },
  ];
  readonly renderEvent = (event: AgendaEvent) =>
    `<span style="display:inline-block;padding:.15rem .6rem;border-radius:999px;background:${event.color};color:#fff;font-size:.8rem">${event.title}</span>`;
}
