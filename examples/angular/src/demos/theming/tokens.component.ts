import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/angular';

// Every part is styled by CSS variables. Override a handful of --doran-* tokens on
// a wrapper — no component overrides — and the same calendar restyles itself.
@Component({
  selector: 'demo-th-tokens',
  standalone: true,
  imports: [ReactiveFormsModule, DoranCalendar],
  template: `
    <div
      style="--doran-day-selected-bg:#e11d48;--doran-day-today-color:#e11d48;--doran-day-today-ring:#fb7185;--doran-day-hover-bg:#fde7ec;--doran-day-radius:10px"
    >
      <dr-calendar [formControl]="value" [locale]="lang()" />
    </div>
  `,
})
export class ThTokens {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl<DoranDate | null>(DoranDate.now());
}
