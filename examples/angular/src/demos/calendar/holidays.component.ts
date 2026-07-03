import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/angular';

// showHolidays marks official-holiday days with a dot and the holiday color,
// wired to the built-in @doranjs/holidays data (no per-day callback needed).
@Component({
  selector: 'demo-cal-holidays',
  standalone: true,
  imports: [ReactiveFormsModule, DoranCalendar],
  template: `<dr-calendar [formControl]="value" [locale]="lang()" [showHolidays]="true" />`,
})
export class CalHolidays {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
