import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/angular';

// headerMode="separate" renders native month and year <select>s instead of the
// in-place dropdown panels.
@Component({
  selector: 'demo-cal-separate-header',
  standalone: true,
  imports: [ReactiveFormsModule, DoranCalendar],
  template: `<dr-calendar [formControl]="value" [locale]="lang()" headerMode="separate" />`,
})
export class CalSeparateHeader {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
