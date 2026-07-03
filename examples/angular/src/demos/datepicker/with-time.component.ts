import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/angular';

// withTime adds a time picker to the popover; a custom display format shows the
// time alongside the date.
@Component({
  selector: 'demo-dp-with-time',
  standalone: true,
  imports: [ReactiveFormsModule, DoranDatePicker],
  template: `
    <dr-date-picker
      [formControl]="value"
      [locale]="lang()"
      [withTime]="true"
      format="dddd D MMMM YYYY — HH:mm"
    />
  `,
})
export class DpWithTime {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
