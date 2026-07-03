import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranRangePicker, type DoranDateRange } from '@doranjs/angular';

// months renders several months side by side, easing the selection of longer ranges.
@Component({
  selector: 'demo-rp-multi-month',
  standalone: true,
  imports: [ReactiveFormsModule, DoranRangePicker],
  template: `<dr-range-picker [formControl]="value" [locale]="lang()" [months]="2" />`,
})
export class RpMultiMonth {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDateRange>({ start: null, end: null });
}
