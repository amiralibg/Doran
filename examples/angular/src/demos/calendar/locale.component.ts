import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/angular';

// The locale input switches the calendar's language. locale="en" renders English
// month/weekday names with Latin digits — the same component.
@Component({
  selector: 'demo-cal-locale',
  standalone: true,
  imports: [ReactiveFormsModule, DoranCalendar],
  template: `
    <dr-calendar [formControl]="value" locale="en" />
    @if (value.value) {
      <p class="result">{{ value.value.withLocale('en').format('dddd D MMMM YYYY') }}</p>
    }
  `,
})
export class CalLocale {
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
