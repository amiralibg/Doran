import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/angular';

// weekends overrides which weekday indices are styled as weekend (0 = Saturday).
// The default is [6] (Friday); here we mark both Thursday and Friday.
@Component({
  selector: 'demo-cal-weekends',
  standalone: true,
  imports: [ReactiveFormsModule, DoranCalendar],
  template: `<dr-calendar [formControl]="value" [locale]="lang()" [weekends]="[5, 6]" />`,
})
export class CalWeekends {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
