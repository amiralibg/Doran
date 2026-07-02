# Doran + Angular example

Minimal Angular (standalone) app using [`@doranjs/angular`](../../packages/angular).

```bash
pnpm create @angular doran-angular --standalone --style css --routing false
pnpm add @doranjs/angular @doranjs/core @angular/forms
```

Add the styles once in `src/styles.css`:

```css
@import '@doranjs/wc/styles.css';
```

`src/app/app.component.ts`:

```ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DoranDatePicker, DoranRangePicker } from '@doranjs/angular';
import type { DoranDate } from '@doranjs/core';
import type { DoranDateRange } from '@doranjs/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, DoranDatePicker, DoranRangePicker],
  template: `
    <main dir="rtl">
      <h1>دوران × Angular</h1>

      <dr-date-picker [formControl]="date" />
      @if (date.value) {
        <p>{{ date.value.format('dddd D MMMM YYYY') }} — {{ date.value.toISOString() }}</p>
      }

      <dr-range-picker [formControl]="range" (change)="onRange($event)" />
    </main>
  `,
})
export class AppComponent {
  date = new FormControl<DoranDate | null>(null);
  range = new FormControl<DoranDateRange>({ start: null, end: null });

  onRange(e: { gregorian: { start: Date | null; end: Date | null } }) {
    console.log(e.gregorian);
  }
}
```

Run it with `pnpm start`.
