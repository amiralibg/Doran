import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/angular';

// withTime adds a time picker and carries the time-of-day on the selected value.
@Component({
  selector: 'demo-cal-with-time',
  standalone: true,
  imports: [ReactiveFormsModule, DoranCalendar],
  template: `
    <dr-calendar [formControl]="value" [locale]="lang()" [withTime]="true" />
    @if (value.value) {
      <p class="result">{{ value.value.withLocale(lang()).format('dddd D MMMM YYYY — HH:mm') }}</p>
    }
  `,
})
export class CalWithTime {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
