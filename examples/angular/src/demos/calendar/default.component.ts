import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/angular';

// The default calendar: dropdown month/year header, Saturday-first weeks, RTL.
// The form value is a DoranDate via ControlValueAccessor.
@Component({
  selector: 'demo-cal-default',
  standalone: true,
  imports: [ReactiveFormsModule, DoranCalendar],
  template: `
    <dr-calendar [formControl]="value" [locale]="lang()" />
    @if (value.value) {
      <p class="result">{{ value.value.withLocale(lang()).format('dddd D MMMM YYYY') }}</p>
    }
  `,
})
export class CalDefault {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
