# @doranjs/angular

Idiomatic **Angular** bindings for Doran. Standalone components, works with Angular 19 and 20, and
Angular Universal (SSR). The components are thin wrappers over the [`@doranjs/wc`](/en/api/wc)
custom elements (the shared engine) and implement `ControlValueAccessor`, so they drop straight
into reactive or template-driven forms. The change convention matches
[`@doranjs/react`](/en/api/react): the form value is a `DoranDate`, and `(change)` **also** reports
the Gregorian `Date`.

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

`[(ngModel)]` works too (import `FormsModule`). Any attribute the underlying element supports
(`locale`, `placeholder`, `format`, `with-time`, `min`, `max`, …) passes straight through to the
custom element — see [`@doranjs/wc`](/en/api/wc) for the full list.

## DatePicker and footer customization

| Input           | Type / value                       | Description                                                              |
| --------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `footerActions` | `('today' \| 'clear')[] \| string` | Ordered Calendar/DatePicker actions; `[]` or `''` hides the whole footer |
| `iconPosition`  | `'left' \| 'right'`                | Trigger icon position; defaults to `left`                                |
| `textAlign`     | `'left' \| 'right'`                | Trigger text alignment; defaults to `right`                              |
| `inputWidth`    | `string`                           | CSS trigger width, such as `18rem`                                       |
| `dropdownWidth` | `'auto' \| 'trigger' \| string`    | Intrinsic, trigger-matched, or custom CSS popover width                  |

```html
<dr-date-picker
  [formControl]="date"
  [footerActions]="['today', 'clear']"
  iconPosition="right"
  textAlign="left"
  inputWidth="18rem"
  dropdownWidth="trigger"
/>
```

Today selects the current date and emits the change; Clear sets both the form value and
`change.value`/`change.gregorian` to `null`. `dr-range-picker` has a Clear control by default;
`[footerActions]="[]"` hides its footer. `hideFooter` on `dr-calendar` is deprecated; use
`[footerActions]="[]"`. Button labels follow the active locale: `fa` uses «امروز»/«پاک کردن», while `en` uses Today/Clear.

Both `[disabled]` and the form control's disabled state disable the native trigger. The DatePicker
cannot open in that state, and an open popover is closed.

## Headless — `createCalendarGrid`

For fully custom markup, a signal-based grid reuses the shared `buildMonthGrid` / `navigateFocus`
from `@doranjs/wc` — no per-framework grid logic:

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

The custom elements load client-side on init (`@doranjs/wc` is SSR-guarded), so server rendering
emits the inert tag and hydration upgrades it. To keep digits/tz deterministic across the two
passes, wrap your app in `DoranProvider` (`dr-provider`) — it sets `locale`/`timeZone` for the
subtree via DI, request-scoped (no mutable global):

```ts
import { DoranProvider, DoranDatePicker } from '@doranjs/angular';
// imports: [DoranProvider, DoranDatePicker]
// template: `<dr-provider locale="fa" timeZone="Asia/Tehran"><dr-date-picker /></dr-provider>`
```

Components resolve locale as **explicit input → provider**. See the [SSR guide](/en/guide/ssr).
