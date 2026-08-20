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

| Attribute        | Elements                               | Description                                                                                                            |
| ---------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `value`          | calendar, datepicker, nlp-input        | `YYYY/MM/DD` (or the raw text for nlp-input)                                                                           |
| `min` / `max`    | calendar, datepicker                   | Selectable bounds                                                                                                      |
| `locale`         | all                                    | `fa` (default) or `en`                                                                                                 |
| `header-mode`    | calendar, rangepicker                  | `dropdown` (default) or `separate`                                                                                     |
| `with-time`      | calendar, datepicker                   | Enable the time picker                                                                                                 |
| `show-holidays`  | calendar, datepicker, rangepicker      | Mark official holidays                                                                                                 |
| `weekends`       | calendar, rangepicker                  | Comma-separated weekday indices (`6` = Fri)                                                                            |
| `placeholder`    | datepicker, nlp-input                  | Placeholder text                                                                                                       |
| `format`         | datepicker, rangedatepicker, nlp-input | Display format pattern; typed digits are masked into this shape as they are entered, and the text is parsed against it |
| `footer-actions` | calendar, datepicker, rangepicker      | Ordered comma/space-separated actions; empty hides the footer                                                          |
| `hide-footer`    | calendar, datepicker, rangepicker      | Deprecated; use `footer-actions=""`                                                                                    |
| `icon-position`  | datepicker                             | `left` (default) or `right`                                                                                            |
| `text-align`     | datepicker                             | `right` (default) or `left`                                                                                            |
| `input-width`    | datepicker                             | CSS trigger width, such as `18rem`                                                                                     |
| `dropdown-width` | datepicker                             | `auto`, `trigger`, or a custom CSS width                                                                               |
| `disabled`       | datepicker                             | Disables the trigger and closes an open popover                                                                        |
| `editable`       | datepicker                             | `editable="false"` makes the trigger a button rather than a text field                                                 |

`footer-actions="today,clear"` preserves the declared button order. Today selects the current
date and emits `change`; Clear removes the value and emits `null` in `detail.date` and
`detail.iso`. RangePicker accepts only `clear` and shows it in the footer by default.
`footer-actions=""` hides the whole footer, including the range summary. Button labels follow `locale`: `fa` uses «امروز»/«پاک کردن», while `en` uses Today/Clear.

`dropdown-width="auto"` uses the intrinsic popover width, `trigger` matches the trigger, and any
other value such as `24rem` is used as a custom CSS width. When `disabled` is present, the
datepicker's native trigger is disabled, cannot open on click, and closes any open popover.

`editable="false"` turns the trigger into a button: the whole field opens the
calendar and a date can only come from the grid. Worth preferring on touch-first
screens, where a text field raises the on-screen keyboard over the calendar and
reaching the picker means hitting the icon. It is read as a string, not by presence,
so `:editable="false"` and `[editable]="false"` from Vue, Svelte, and Angular all say
what they mean. Unlike `readonly`, which keeps a real `<input>` and only refuses new
text, there is no text field at all.

On a coarse pointer the datepicker gives up the caret as the calendar opens, so the
keyboard is gone before the panel is placed, and it does not take focus back after a
date is picked — the keyboard would otherwise cover the calendar and, dismissing
itself mid-tap, move the panel out from under the finger. The panel is measured
against the visual viewport rather than `window.innerHeight`, and holds still for the
length of any gesture that starts on it.

Under 640px the calendar is presented as a **bottom sheet** rather than anchored to
the trigger — that is `mode="auto"`, and it is the default for `<doran-datepicker>`
and `<doran-rangedatepicker>` alike. Pass `mode="popover"` to anchor it everywhere, or
`mode="sheet"` for a sheet at every width. The sheet is full-bleed, dims the page
behind it, and scrolls internally; inside it days grow to a 44px touch target, the
range picker's months stack rather than sitting side by side, and its presets become a
horizontal strip. Tune it with `--doran-sheet-bg`, `--doran-sheet-backdrop`,
`--doran-sheet-radius`, `--doran-sheet-padding`, `--doran-sheet-content-width`, and
`--doran-day-size-touch`.

`<doran-rangedatepicker>` opens on focus, so on a touch device it cannot give up the
caret the way `<doran-datepicker>` does — that is the very thing that opened it. Its
fields go `readonly` instead while presenting as a sheet on a coarse pointer, which is
the one signal browsers honour for "focus this, but do not raise a keyboard"; a
keyboard would otherwise cover the sheet it just opened. Typing still works everywhere
else, including a narrow desktop window. Pass `mode="popover"` if you would rather
type on a phone than see the whole calendar.

`format` drives typing as well as display. Digits flow into the pattern as they are
entered — `14020512` becomes `۱۴۰۲/۰۵/۱۲` with no separators typed — and fields
advance the way a native date input does: `95` is no month, so the `9` becomes month
`09` and the `5` starts the day. A separator you type closes the field early, keeping
`1402-1-2` as month 1 / day 2. The text is parsed back against the same pattern, so
`format="MM-DD-YYYY"` accepts `05-12-1402`. Patterns built from text tokens (`MMMM`,
`dddd`) cannot be masked and stay free-typing, settling on blur.

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
