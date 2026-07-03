import { Component, input } from '@angular/core';
import { DoranDate } from '@doranjs/core';
import { DoranAgenda } from '@doranjs/angular';
import { type AgendaEvent } from '@doranjs/wc';

// days sets how many days to render — here a 3-day view starting today.
@Component({
  selector: 'demo-ag-days',
  standalone: true,
  imports: [DoranAgenda],
  template: `<dr-agenda [start]="start" [days]="3" [events]="events" [locale]="lang()" />`,
})
export class AgDays {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly start = DoranDate.now().startOf('day');
  readonly events: AgendaEvent[] = [
    { id: '1', date: this.start, title: 'امروز: تماس با مشتری', color: 'var(--doran-primary)' },
    { id: '2', date: this.start.addDays(2), title: 'پس‌فردا: انتشار گزارش' },
  ];
}
