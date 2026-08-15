import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { type DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/angular';

// format controls how the selected date is displayed — and how typing is masked:
// digits flow into this shape as they are entered, so here 14030101 becomes
// 1403-01-01. placeholder is the empty-state hint; the field starts empty so it
// is visible.
@Component({
  selector: 'demo-dp-format',
  standalone: true,
  imports: [ReactiveFormsModule, DoranDatePicker],
  template: `
    <dr-date-picker
      [formControl]="value"
      [locale]="lang()"
      format="YYYY-MM-DD"
      placeholder="۱۴۰۳-۰۱-۰۱"
    />
  `,
})
export class DpFormat {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(null);
}
