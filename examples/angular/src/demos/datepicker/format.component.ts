import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { type DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/angular';

// format controls how the selected date is displayed; placeholder is the
// empty-state hint. Starts empty so the placeholder is visible.
@Component({
  selector: 'demo-dp-format',
  standalone: true,
  imports: [ReactiveFormsModule, DoranDatePicker],
  template: `
    <dr-date-picker
      [formControl]="value"
      [locale]="lang()"
      format="YYYY/MM/DD"
      placeholder="۱۴۰۳/۰۱/۰۱"
    />
  `,
})
export class DpFormat {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(null);
}
