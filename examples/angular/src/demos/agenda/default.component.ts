import { Component, input } from '@angular/core';
import { DoranDate } from '@doranjs/core';
import { DoranAgenda } from '@doranjs/angular';
import { type AgendaEvent } from '@doranjs/wc';

// One week of days starting Saturday, each with its events. start is the first
// day; events are placed on their date.
@Component({
  selector: 'demo-ag-default',
  standalone: true,
  imports: [DoranAgenda],
  template: `<dr-agenda [start]="weekStart" [events]="events" [locale]="lang()" />`,
})
export class AgDefault {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly weekStart = DoranDate.now().startOf('week');
  readonly events: AgendaEvent[] = [
    {
      id: '1',
      date: this.weekStart.addDays(1),
      title: 'جلسهٔ هفتگی تیم',
      color: 'var(--doran-primary)',
    },
    { id: '2', date: this.weekStart.addDays(1), title: 'بازبینی کد' },
    {
      id: '3',
      date: this.weekStart.addDays(3),
      title: 'تحویل نسخهٔ جدید',
      color: 'var(--doran-accent)',
    },
  ];
}
