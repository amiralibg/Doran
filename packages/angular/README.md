# @doranjs/angular

Idiomatic **Angular** bindings for [Doran](https://github.com/amiralibg/Doran) — the Persian (Jalali) calendar. Standalone components, works with Angular 19 and 20, and Angular Universal (SSR).

The components are thin wrappers over the [`@doranjs/wc`](https://github.com/amiralibg/Doran/tree/main/packages/wc) custom elements (the shared engine), so the calendar/grid logic isn't reimplemented per framework. They implement `ControlValueAccessor`, so they drop straight into reactive or template-driven forms. The change convention matches [`@doranjs/react`](https://github.com/amiralibg/Doran/tree/main/packages/react): the form value is a `DoranDate`, and `(change)` **also** reports the Gregorian `Date`.

```bash
pnpm add @doranjs/angular @doranjs/core @angular/forms
```

```css
/* load the styles once, e.g. in styles.css */
@import '@doranjs/wc/styles.css';
```

## Components

Standalone — import the class into a component's `imports` (no NgModule).

| Class              | Selector          | Form value                      | `(change)`                             |
| ------------------ | ----------------- | ------------------------------- | -------------------------------------- |
| `DoranDatePicker`  | `dr-date-picker`  | `DoranDate \| null`             | `{ value, gregorian: Date \| null }`   |
| `DoranCalendar`    | `dr-calendar`     | `DoranDate \| null`             | `{ value, gregorian: Date \| null }`   |
| `DoranRangePicker` | `dr-range-picker` | `{ start, end }` of `DoranDate` | `{ value, gregorian: { start, end } }` |
| `DoranNlpInput`    | `dr-nlp-input`    | `string`                        | `(resolve)` / `(change)` parsed result |
| `DoranAgenda`      | `dr-agenda`       | — (`[events]` input)            | `(selectday)` → `DoranDate`            |

### Reactive forms

```ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DoranDatePicker } from '@doranjs/angular';
import type { DoranDate } from '@doranjs/core';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [ReactiveFormsModule, DoranDatePicker],
  template: `
    <dr-date-picker [formControl]="date" locale="fa" (change)="onChange($event)" />
    @if (date.value) {
      <p>{{ date.value.format('dddd D MMMM YYYY') }}</p>
    }
  `,
})
export class BookingComponent {
  date = new FormControl<DoranDate | null>(null);

  onChange(e: { value: DoranDate | null; gregorian: Date | null }) {
    // Post Gregorian ISO straight to your backend.
    if (e.gregorian)
      fetch('/api/save', { body: JSON.stringify({ at: e.gregorian.toISOString() }) });
  }
}
```

`[(ngModel)]` works too (import `FormsModule`). Any attribute the underlying element supports (`locale`, `placeholder`, `format`, `with-time`, `min`, `max`, …) passes straight through to the custom element.

## Headless — `createCalendarGrid`

For fully custom markup, a signal-based grid reuses the shared `buildMonthGrid` / `navigateFocus` from `@doranjs/wc` — no per-framework grid logic:

```ts
import { Component } from '@angular/core';
import { createCalendarGrid } from '@doranjs/angular';

@Component({
  selector: 'app-mini-cal',
  standalone: true,
  template: `
    <button (click)="cal.prev()">‹</button>
    @for (week of cal.grid().weeks; track $index) {
      @for (day of week; track day.date.toISOString()) {
        <span [class.dim]="!day.inCurrentMonth">{{ day.day }}</span>
      }
    }
    <button (click)="cal.next()">›</button>
  `,
})
export class MiniCalComponent {
  cal = createCalendarGrid();
}
```

## SSR (Angular Universal)

The custom elements load client-side on init (`@doranjs/wc` is SSR-guarded), so server rendering emits the inert tag and hydration upgrades it.

---

> Part of the framework-bindings effort ([#22](https://github.com/amiralibg/Doran/issues/22)), alongside [`@doranjs/vue`](https://github.com/amiralibg/Doran/tree/main/packages/vue) and [`@doranjs/svelte`](https://github.com/amiralibg/Doran/tree/main/packages/svelte).
