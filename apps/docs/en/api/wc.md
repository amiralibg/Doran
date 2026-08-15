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

| Attribute        | Elements                          | Description                                                   |
| ---------------- | --------------------------------- | ------------------------------------------------------------- |
| `value`          | calendar, datepicker, nlp-input   | `YYYY/MM/DD` (or the raw text for nlp-input)                  |
| `min` / `max`    | calendar, datepicker              | Selectable bounds                                             |
| `locale`         | all                               | `fa` (default) or `en`                                        |
| `header-mode`    | calendar, rangepicker             | `dropdown` (default) or `separate`                            |
| `with-time`      | calendar, datepicker              | Enable the time picker                                        |
| `show-holidays`  | calendar, datepicker, rangepicker | Mark official holidays                                        |
| `weekends`       | calendar, rangepicker             | Comma-separated weekday indices (`6` = Fri)                   |
| `placeholder`    | datepicker, nlp-input             | Placeholder text                                              |
| `format`         | datepicker, nlp-input             | Display/preview format pattern                                |
| `footer-actions` | calendar, datepicker, rangepicker | Ordered comma/space-separated actions; empty hides the footer |
| `hide-footer`    | calendar, datepicker, rangepicker | Deprecated; use `footer-actions=""`                           |
| `icon-position`  | datepicker                        | `left` (default) or `right`                                   |
| `text-align`     | datepicker                        | `right` (default) or `left`                                   |
| `input-width`    | datepicker                        | CSS trigger width, such as `18rem`                            |
| `dropdown-width` | datepicker                        | `auto`, `trigger`, or a custom CSS width                      |
| `disabled`       | datepicker                        | Disables the trigger and closes an open popover               |

`footer-actions="today,clear"` preserves the declared button order. Today selects the current
date and emits `change`; Clear removes the value and emits `null` in `detail.date` and
`detail.iso`. RangePicker accepts only `clear` and shows it in the footer by default.
`footer-actions=""` hides the whole footer, including the range summary. Button labels follow `locale`: `fa` uses «امروز»/«پاک کردن», while `en` uses Today/Clear.

`dropdown-width="auto"` uses the intrinsic popover width, `trigger` matches the trigger, and any
other value such as `24rem` is used as a custom CSS width. When `disabled` is present, the
datepicker's native trigger is disabled, cannot open on click, and closes any open popover.

## Events

All elements emit a bubbling `change` `CustomEvent`:

```js
document.querySelector('doran-calendar').addEventListener('change', (e) => {
  console.log(e.detail.date); // DoranDate, or null after Clear
  console.log(e.detail.value); // formatted string
});

document.querySelector('doran-rangepicker').addEventListener('change', (e) => {
  console.log(e.detail.start, e.detail.end);
});

document.querySelector('doran-nlp-input').addEventListener('resolve', (e) => {
  console.log(e.detail.result); // ParseResult | null
});
```

## Day widgets

Annotate individual days — a fare, a seat count, an availability badge. These are JS
properties rather than attributes, since a day map and a predicate can't be stringified.

```js
const picker = document.querySelector('doran-datepicker');

picker.dayData = {
  '1404-5-12': { text: '1,200,000', tone: 'low' },
  '1404-5-14': { disabled: true, disabledReason: 'Sold out' },
};

picker.disabledDates = (day) => day.dayOfWeek === 6;
```

Available on `<doran-calendar>`, `<doran-datepicker>`, and `<doran-rangepicker>`. Keys
are Jalali `YYYY-M-D`; zero-padded and Persian-digit forms resolve to the same day.

`tone` becomes `data-tone` on the annotation: `low`/`positive` and `high`/`negative`
are styled out of the box, and any other value passes through for your own CSS.

A blocked day carries `aria-disabled` rather than the `disabled` attribute, so it stays
focusable and its `disabledReason` — a tooltip _and_ part of the day's accessible name —
can actually be heard.

## Slots

`legend`, `aside`, and `footer` accept light-DOM children, so Vue, Svelte, and Angular
templates fill them with no wrapper support needed:

```html
<doran-datepicker>
  <div slot="legend">Cheapest fare highlighted</div>
  <div slot="footer">Prices in toman</div>
</doran-datepicker>
```

`<doran-datepicker>` forwards `dayData`, `disabledDates`, and its slot children to the
pop-over calendar. `<doran-rangepicker>` shares its sidebar between an `aside` slot and
its presets.

## Theming

The elements reuse the same class names and CSS variables as the React components, so
[the full token set](/en/api/ui) applies. Override per instance with inline styles:

```html
<doran-calendar style="--doran-day-selected-bg: #e11d48; --doran-calendar-radius: 22px">
</doran-calendar>
```

## Range picker with a trigger

```html
<doran-rangedatepicker presets months="2"></doran-rangedatepicker>
```

One trigger holding two fields, either typable or fillable from the grid, with the
ends kept in order. Accepts `dayData` and `disabledDates` as properties and the same
`legend`/`aside`/`footer` slots. `<doran-rangepicker>` remains the inline version.

## Time picker

`hour-step` and `minute-step` control how far one arrow press moves each unit, both
defaulting to `1`. Every field can be typed into as well as stepped, and `readonly`
stops typing while leaving the steppers usable.
