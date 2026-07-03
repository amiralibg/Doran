import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/angular';

// A date input that opens a calendar popover on click. The form value is a DoranDate.
@Component({
  selector: 'demo-dp-default',
  standalone: true,
  imports: [ReactiveFormsModule, DoranDatePicker],
  template: `<dr-date-picker [formControl]="value" [locale]="lang()" />`,
})
export class DpDefault {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
