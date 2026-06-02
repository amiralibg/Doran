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

See the [documentation](https://amiralibg.github.io/Doran/api/wc) for all attributes,
events, and theming options.
