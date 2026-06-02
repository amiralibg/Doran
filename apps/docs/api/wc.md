# @doranjs/wc

Framework-agnostic **Web Components** (custom elements) — use Doran in plain HTML, or
with Vue, Svelte, Angular, or any framework.

## Install (bundler)

```ts
import '@doranjs/wc'; // auto-registers the elements
import '@doranjs/wc/styles.css'; // tokens + component styles in one file
```

## From a CDN (no build step)

```html
<link rel="stylesheet" href="https://unpkg.com/@doranjs/wc/dist/styles.css" />
<script src="https://unpkg.com/@doranjs/wc/dist/doran.global.js"></script>
```

## Elements

| Tag                   | Description                                      |
| --------------------- | ------------------------------------------------ |
| `<doran-calendar>`    | Full month calendar with month/year/time pickers |
| `<doran-datepicker>`  | Input with a pop-over calendar                   |
| `<doran-rangepicker>` | Two-click date-range selection                   |
| `<doran-nlp-input>`   | Natural-language input with autocomplete + hint  |

```html
<doran-calendar show-holidays value="1405/03/12" header-mode="dropdown"></doran-calendar>
<doran-datepicker with-time placeholder="تاریخ و ساعت"></doran-datepicker>
<doran-rangepicker show-holidays></doran-rangepicker>
<doran-nlp-input value="جمعه ساعت ۷ شب"></doran-nlp-input>
```

## Attributes

| Attribute       | Elements                          | Description                                  |
| --------------- | --------------------------------- | -------------------------------------------- |
| `value`         | calendar, datepicker, nlp-input   | `YYYY/MM/DD` (or the raw text for nlp-input) |
| `min` / `max`   | calendar, datepicker              | Selectable bounds                            |
| `locale`        | all                               | `fa` (default) or `en`                       |
| `header-mode`   | calendar, rangepicker             | `dropdown` (default) or `separate`           |
| `with-time`     | calendar, datepicker              | Enable the time picker                       |
| `show-holidays` | calendar, datepicker, rangepicker | Mark official holidays                       |
| `weekends`      | calendar, rangepicker             | Comma-separated weekday indices (`6` = Fri)  |
| `placeholder`   | datepicker, nlp-input             | Placeholder text                             |
| `format`        | datepicker, nlp-input             | Display/preview format pattern               |

## Events

All elements emit a bubbling `change` `CustomEvent`:

```js
document.querySelector('doran-calendar').addEventListener('change', (e) => {
  console.log(e.detail.date); // a DoranDate
  console.log(e.detail.value); // formatted string
});

document.querySelector('doran-rangepicker').addEventListener('change', (e) => {
  console.log(e.detail.start, e.detail.end);
});

document.querySelector('doran-nlp-input').addEventListener('resolve', (e) => {
  console.log(e.detail.result); // ParseResult | null
});
```

## Theming

The elements reuse the same class names and CSS variables as the React components, so
[the full token set](/api/ui) applies. Override per instance with inline styles:

```html
<doran-calendar style="--doran-day-selected-bg: #e11d48; --doran-calendar-radius: 22px">
</doran-calendar>
```
