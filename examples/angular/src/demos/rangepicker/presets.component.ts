import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranRangePicker, type DoranDateRange } from '@doranjs/angular';

// presets adds shortcut buttons (last 7 days, this month, …) above the calendar,
// using the built-in set.
@Component({
  selector: 'demo-rp-presets',
  standalone: true,
  imports: [ReactiveFormsModule, DoranRangePicker],
  template: `<dr-range-picker [formControl]="value" [locale]="lang()" [presets]="true" />`,
})
export class RpPresets {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDateRange>({ start: null, end: null });
}
