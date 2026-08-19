import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { type DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/angular';

@Component({
  selector: 'demo-dp-pick-only',
  standalone: true,
  imports: [ReactiveFormsModule, DoranDatePicker],
  template: `
    <!-- The trigger becomes a button: the whole field opens the calendar and no
         on-screen keyboard ever appears over it. -->
    <dr-date-picker
      [formControl]="value"
      [locale]="lang()"
      [editable]="false"
      mode="auto"
      inputWidth="14rem"
    />
  `,
})
export class DpPickOnly {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(null);
}
