# @doranjs/angular

بایندینگ‌های اصطلاحیِ **Angular** برای دوران. کامپوننت‌های standalone، سازگار با Angular 19 و 20 و
Angular Universal (SSR). کامپوننت‌ها wrapperهای نازکی روی custom elementهای [`@doranjs/wc`](/api/wc)
(موتور مشترک) هستند و `ControlValueAccessor` را پیاده‌سازی می‌کنند، پس مستقیم داخلِ فرم‌های reactive
یا template-driven می‌افتند. قرارداد تغییر با [`@doranjs/react`](/api/react) یکسان است: مقدارِ فرم
یک `DoranDate` است و `(change)` **علاوه بر آن** `Date`ِ میلادی را هم گزارش می‌کند.

```bash
pnpm add @doranjs/angular @doranjs/core @angular/forms
```

```css
/* استایل‌ها را یک بار بارگذاری کنید، مثلاً در styles.css */
@import '@doranjs/wc/styles.css';
```

## کامپوننت‌ها

standalone — کلاس را به `imports`ِ کامپوننت اضافه کنید (بدون NgModule).

| کلاس               | Selector          | مقدارِ فرم                      | `(change)`                             |
| ------------------ | ----------------- | ------------------------------- | -------------------------------------- |
| `DoranDatePicker`  | `dr-date-picker`  | `DoranDate \| null`             | `{ value, gregorian: Date \| null }`   |
| `DoranCalendar`    | `dr-calendar`     | `DoranDate \| null`             | `{ value, gregorian: Date \| null }`   |
| `DoranRangePicker` | `dr-range-picker` | `{ start, end }` از `DoranDate` | `{ value, gregorian: { start, end } }` |
| `DoranNlpInput`    | `dr-nlp-input`    | `string`                        | `(resolve)` / `(change)` نتیجهٔ parse  |
| `DoranAgenda`      | `dr-agenda`       | — (ورودیِ `[events]`)           | `(selectday)` → `DoranDate`            |

### فرم‌های reactive

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
    // میلادیِ ISO را مستقیم به backend بفرستید.
    if (e.gregorian)
      fetch('/api/save', { body: JSON.stringify({ at: e.gregorian.toISOString() }) });
  }
}
```

`[(ngModel)]` هم کار می‌کند (‏`FormsModule` را import کنید). هر attribute‌ای که عنصرِ زیرین
پشتیبانی می‌کند (`locale`، `placeholder`، `format`، `with-time`، `min`، `max`، …) مستقیماً به
custom element pass می‌شود — فهرست کامل در [`@doranjs/wc`](/api/wc).

## headless — `createCalendarGrid`

برای markupِ کاملاً دلخواه، یک گریدِ signal-based همان `buildMonthGrid` / `navigateFocus`ِ مشترکِ
`@doranjs/wc` را دوباره استفاده می‌کند — بدون منطقِ گریدِ per-framework:

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

custom elementها سمتِ کلاینت هنگام init بارگذاری می‌شوند (`@doranjs/wc` نسبت به SSR گارد شده)، پس
رندرِ سرور تگِ inert را emit می‌کند و hydration آن را upgrade می‌کند. برای اینکه ارقام/تایم‌زون در
هر دو pass قطعی بمانند، برنامه را در `DoranProvider` (`dr-provider`) بپیچید — این کامپوننت
`locale`/`timeZone` را برای subtree از طریقِ DI تنظیم می‌کند، request-scoped (بدون globalِ mutable):

```ts
import { DoranProvider, DoranDatePicker } from '@doranjs/angular';
// imports: [DoranProvider, DoranDatePicker]
// template: `<dr-provider locale="fa" timeZone="Asia/Tehran"><dr-date-picker /></dr-provider>`
```

کامپوننت‌ها locale را به‌ترتیبِ **inputِ صریح → provider** resolve می‌کنند. راهنمای
[SSR](/guide/ssr) را ببینید.
