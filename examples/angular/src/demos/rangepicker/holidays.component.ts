import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranRangePicker, type DoranDateRange } from '@doranjs/angular';

// The same holiday/weekend marking as the calendar — showHolidays and weekends
// carry straight over to the range picker.
@Component({
  selector: 'demo-rp-holidays',
  standalone: true,
  imports: [ReactiveFormsModule, DoranRangePicker],
  template: `
    <dr-range-picker
      [formControl]="value"
      [locale]="lang()"
      [showHolidays]="true"
      [weekends]="[5, 6]"
    />
  `,
})
export class RpHolidays {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDateRange>({ start: null, end: null });
}
