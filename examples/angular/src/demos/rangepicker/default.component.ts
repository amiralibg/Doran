import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranRangePicker, type DoranDateRange } from '@doranjs/angular';

// Click a start day, then an end day. The form value is a { start, end } of DoranDate.
@Component({
  selector: 'demo-rp-default',
  standalone: true,
  imports: [ReactiveFormsModule, DoranRangePicker],
  template: `<dr-range-picker [formControl]="value" [locale]="lang()" />`,
})
export class RpDefault {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDateRange>({ start: null, end: null });
}
