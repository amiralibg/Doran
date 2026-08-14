# @doranjs/wc

Framework-agnostic **Web Components** for the Solar Hijri (Persian / Jalali) calendar.
Use Doran in plain HTML, or with any framework — Vue, Svelte, Angular, or none at all.

```bash
pnpm add @doranjs/wc
```

```ts
import '@doranjs/wc'; // registers the custom elements
import '@doranjs/wc/styles.css'; // design tokens + component styles
```

```html
<doran-calendar show-holidays value="1405/03/12"></doran-calendar>
<doran-datepicker with-time placeholder="تاریخ و ساعت"></doran-datepicker>
<doran-rangepicker show-holidays></doran-rangepicker>
<doran-nlp-input value="جمعه ساعت ۷ شب"></doran-nlp-input>
```

### From a CDN (no build step)

```html
<link rel="stylesheet" href="https://unpkg.com/@doranjs/wc/dist/styles.css" />
<script src="https://unpkg.com/@doranjs/wc/dist/doran.global.js"></script>
<doran-calendar></doran-calendar>
```

## Elements

| Tag                   | Description                                     |
| --------------------- | ----------------------------------------------- |
| `<doran-calendar>`    | Month calendar with month/year/time pickers     |
| `<doran-datepicker>`  | Input with a pop-over calendar                  |
| `<doran-rangepicker>` | Two-click date-range selection                  |
| `<doran-nlp-input>`   | Natural-language input with autocomplete + hint |

Listen for `change` (and `resolve` on the NLP input) `CustomEvent`s:

```js
document.querySelector('doran-calendar').addEventListener('change', (e) => {
  console.log(e.detail.date, e.detail.value);
});
```

## Day widgets

Annotate individual days — a fare, a seat count, an availability badge. This is a JS
property rather than an attribute, since a day map can't be stringified:

```js
const picker = document.querySelector('doran-datepicker');

picker.dayData = {
  '1404-5-12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' },
  '1404-5-14': { disabled: true, disabledReason: 'ظرفیت تکمیل' },
};

// Block days beyond min/max — booked dates, sold-out departures.
picker.disabledDates = (day) => day.dayOfWeek === 6;
```

Keys are Jalali `YYYY-M-D`; zero-padded and Persian-digit forms (`'1404/05/12'`,
`'۱۴۰۴/۰۵/۱۲'`) resolve to the same day. `tone` becomes `data-tone` on the annotation:
`low`/`positive` and `high`/`negative` are styled out of the box, and any other value
passes through for your own CSS.

A blocked day carries `aria-disabled` rather than the `disabled` attribute, so it stays
focusable and its `disabledReason` — a tooltip _and_ part of the day's accessible name —
can actually be heard.

## Slots

`legend`, `aside`, and `footer` accept light-DOM children, so Vue, Svelte, and Angular
templates fill them with no wrapper support needed:

```html
<doran-datepicker>
  <div slot="legend">🟢 ارزان‌ترین نرخ</div>
  <div slot="footer">قیمت‌ها به تومان است</div>
</doran-datepicker>
```

`<doran-datepicker>` forwards both `dayData` and its slot children to the pop-over
calendar.

See the [documentation](https://amiralibg.github.io/Doran/api/wc) for all attributes,
events, and theming options.
