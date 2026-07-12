import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/angular';

@Component({
  selector: 'demo-dp-customization',
  standalone: true,
  imports: [ReactiveFormsModule, DoranDatePicker],
  template: `
    <dr-date-picker
      [formControl]="value"
      [locale]="lang()"
      [footerActions]="['today', 'clear']"
      iconPosition="right"
      textAlign="left"
      inputWidth="18rem"
      dropdownWidth="trigger"
    />
  `,
})
export class DpCustomization {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
