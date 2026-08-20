# @doranjs/react

RTL-first, accessible React calendar components.

```ts
import '@doranjs/ui/styles.css';
import '@doranjs/react/styles.css';
```

## Components

| Component          | Description                                         |
| ------------------ | --------------------------------------------------- |
| `DoranCalendar`    | Full month calendar with header navigation          |
| `DoranMonthView`   | A single accessible month grid (the building block) |
| `DoranDatePicker`  | Input with a pop-over calendar                      |
| `DoranRangePicker` | Two-click date-range selection                      |
| `DoranTimePicker`  | Standalone hour/minute time picker                  |
| `DoranNlpInput`    | Natural-language input with autocomplete + hint     |
| `DoranAgenda`      | Vertical day-by-day agenda with events              |

```tsx
import { DoranCalendar, DoranDatePicker } from '@doranjs/react';

<DoranCalendar defaultValue={DoranDate.now()} onChange={(d) => ...} />
<DoranDatePicker placeholder="انتخاب تاریخ" />
```

## `DoranDatePicker` props

| Prop              | Type                                                         | Default              | Description                                                                                                                                   |
| ----------------- | ------------------------------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`           | `DoranDate \| null`                                          | —                    | Controlled value                                                                                                                              |
| `defaultValue`    | `DoranDate \| null`                                          | —                    | Uncontrolled initial value                                                                                                                    |
| `onChange`        | `(date: DoranDate \| null, gregorian: Date \| null) => void` | —                    | Called on selection or Clear; second arg is the native `Date` for backend use                                                                 |
| `locale`          | `Locale \| string`                                           | `getDefaultLocale()` | Formatting locale — falls back to the global default set by `setDefaultLocale()`                                                              |
| `format`          | `string`                                                     | `'YYYY/MM/DD'`       | Display pattern (`+ 'HH:mm'` when `withTime`); typed digits are masked into this shape as they are entered, and the text is parsed against it |
| `placeholder`     | `string`                                                     | `'انتخاب تاریخ'`     | Input placeholder                                                                                                                             |
| `footerActions`   | `readonly ('today' \| 'clear')[]`                            | `['today']`          | Ordered footer actions; an empty array hides the footer                                                                                       |
| `hideFooter`      | `boolean`                                                    | `false`              | Deprecated; use `footerActions={[]}`                                                                                                          |
| `iconPosition`    | `'left' \| 'right'`                                          | `'left'`             | Trigger icon position                                                                                                                         |
| `textAlign`       | `'left' \| 'right'`                                          | `'right'`            | Trigger text alignment                                                                                                                        |
| `inputWidth`      | `CSSProperties['width']`                                     | —                    | Trigger width; numbers are interpreted as pixels                                                                                              |
| `dropdownWidth`   | `'auto' \| 'trigger' \| CSSProperties['width']`              | `'auto'`             | Intrinsic, trigger-matched, or custom CSS popover width                                                                                       |
| `min`             | `DoranDate`                                                  | —                    | Earliest selectable date                                                                                                                      |
| `max`             | `DoranDate`                                                  | —                    | Latest selectable date                                                                                                                        |
| `disabled`        | `boolean`                                                    | `false`              | Disables the input                                                                                                                            |
| `className`       | `string`                                                     | —                    | Added to the root element                                                                                                                     |
| `style`           | `CSSProperties`                                              | —                    | Inline style forwarded to the root element                                                                                                    |
| `id`              | `string`                                                     | —                    | `id` forwarded to the root element                                                                                                            |
| `size`            | `'sm' \| 'md' \| 'lg'`                                       | —                    | Preset heights: 32 / 40 / 48 px                                                                                                               |
| `withTime`        | `boolean`                                                    | `false`              | Show a time picker and carry the time on the value                                                                                            |
| `headerMode`      | `'dropdown' \| 'separate'`                                   | `'dropdown'`         | In-place month/year panels, or native `<select>`s                                                                                             |
| `minuteStep`      | `number`                                                     | `1`                  | Minute increment for the time stepper                                                                                                         |
| `isHoliday`       | `(day: DoranDate) => boolean`                                | —                    | Mark holiday days (dot + holiday color)                                                                                                       |
| `weekends`        | `number[]`                                                   | `[6]`                | Weekday indices treated as weekend (0 = Saturday)                                                                                             |
| `arrows`          | `{ prev, next }`                                             | chevrons             | Custom navigation arrow nodes                                                                                                                 |
| `showOutsideDays` | `boolean`                                                    | —                    | Show days from adjacent months in the grid                                                                                                    |

```tsx
// Minimal usage
<DoranDatePicker onChange={(_d, gregorian) => console.log(gregorian?.toISOString())} />;

// Controlled, with backend POST
const [date, setDate] = useState<DoranDate | null>(null);
<DoranDatePicker
  value={date}
  size="md"
  style={{ width: 200 }}
  onChange={(d, greg) => {
    setDate(d);
    if (greg) await api.post('/events', { date: greg.toISOString() });
  }}
/>;

// Locale follows global default — call once at app root:
setDefaultLocale(enUS);
// Every picker now uses Latin digits, English names, and Today/Clear labels.
```

## `DoranRangePicker` props

| Prop             | Type                                                        | Default              | Description                                                             |
| ---------------- | ----------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------- |
| `value`          | `DateRange`                                                 | —                    | Controlled range (`{ start, end }`)                                     |
| `defaultValue`   | `DateRange`                                                 | —                    | Uncontrolled initial range                                              |
| `onChange`       | `(range: DateRange, gregorian: GregorianDateRange) => void` | —                    | Called on each selection step; second arg carries native `Date` objects |
| `locale`         | `Locale \| string`                                          | `getDefaultLocale()` | Falls back to the global default                                        |
| `numberOfMonths` | `number`                                                    | `1`                  | Side-by-side month grids                                                |
| `presets`        | `boolean \| RangePreset[]`                                  | —                    | `true` for built-in presets, or a custom array                          |
| `footerActions`  | `readonly 'clear'[]`                                        | `['clear']`          | Footer Clear control; an empty array hides the footer                   |
| `isHoliday`      | `(day: DoranDate) => boolean`                               | —                    | Mark holiday days                                                       |
| `weekends`       | `number[]`                                                  | `[6]`                | Weekend indices                                                         |

```tsx
import { DoranRangePicker, type GregorianDateRange } from '@doranjs/react';

<DoranRangePicker
  presets
  onChange={(range, { start, end }) => {
    if (start && end) {
      setFilter({ from: start.toISOString(), to: end.toISOString() });
    }
  }}
/>;
```

## Footer actions

`DoranCalendar` and `DoranDatePicker` accept ordered `today` and `clear` actions through
`footerActions`, for example `['today', 'clear']`. An empty array hides the whole footer. Today
selects the current date and calls `onChange`; Clear removes the value and emits `onChange(null)`
(with a `null` Gregorian argument from DatePicker).

`DoranRangePicker` shows a Clear control in its footer by default.
`footerActions={[]}` hides it together with the range summary. `hideFooter` remains for backward
compatibility but is deprecated. Button labels follow the active locale: `faIR` uses «امروز»/«پاک کردن», while `enUS` uses Today/Clear.

## Month, year & time selection

`DoranCalendar` (and `DoranDatePicker`) accept:

| Prop         | Type                       | Default      | Description                                        |
| ------------ | -------------------------- | ------------ | -------------------------------------------------- |
| `headerMode` | `'dropdown' \| 'separate'` | `'dropdown'` | In-place month/year panels, or native `<select>`s  |
| `withTime`   | `boolean`                  | `false`      | Show a time picker and carry the time on the value |
| `minuteStep` | `number`                   | `1`          | Minute increment for the time stepper              |
| `isHoliday`  | `(day) => boolean`         | —            | Mark holiday days (dot + holiday color)            |
| `weekends`   | `number[]`                 | `[6]`        | Weekday indices treated as weekend (0 = Saturday)  |
| `arrows`     | `{ prev, next }`           | chevrons     | Custom navigation arrow nodes                      |

```tsx
import { getHolidaysOn } from '@doranjs/holidays';

<DoranCalendar
  withTime
  headerMode="dropdown"
  isHoliday={(d) => getHolidaysOn(d).some((h) => h.official)}
/>;
```

## Natural-language input

```tsx
import { DoranNlpInput } from '@doranjs/react';

<DoranNlpInput placeholder="مثلاً: جمعه ساعت ۷ شب" onResolve={(r) => console.log(r?.date)} />;
```

Shows a live autocomplete dropdown and a resolved-date hint pinned to the opposite
(LTR) end of the field. The headless `useNlpSuggest(text, options)` hook returns
`{ result, suggestions }` for building your own UI.

## Typing a date

The trigger is a real text field, so a date can be typed as well as picked.
Typed digits are masked into the `format` pattern as they go: typing `14020512`
shows `۱۴۰۲/۰۵/۱۲` without typing separators, and backspace deletes through
separators. `1402/5/12`, `1402-5-12`, and `۱۴۰۲/۰۵/۱۲` all parse too.

Fields advance the way a native date input does. A digit that cannot fit the field
being typed moves on: `95` is no month, so the `9` becomes month `09` and the `5`
starts the day. Typing a separator yourself closes the field early, which is what
keeps `1402-1-2` as month 1 / day 2 instead of month 12.

With a custom `format`, display and typing follow the same pattern —
`format="MM-DD-YYYY"` accepts `05-12-1402`-style input. A `format` built from text
tokens (`MMMM`, `dddd`) cannot be masked, so those fields stay free-typing and
settle on blur.

Errors surface on blur rather than per keystroke: en route to `1402/05/12` the value
passes through `1`, `14`, `140`, and flagging each would leave the field red the whole
time it is in use. Text that doesn't parse is kept and marked `aria-invalid` rather
than discarded; `onParseError` reports it. Pass `readOnly` where a date must come from
the grid.

The calendar opens on the icon, on `ArrowDown`, and deliberately not on focus, which
would fight typing. It also does not take focus when it opens — that would pull the
caret out of the field.

## A trigger that isn't typable

Pass `editable={false}` to turn the trigger into a button. The whole field opens the
calendar, and a date can only come from the grid.

```tsx
<DoranDatePicker editable={false} />
```

Worth preferring on touch-first screens. A text field raises the on-screen keyboard
over the calendar, and reaching the picker means hitting the icon rather than
anywhere in the field.

This is not `readOnly`, which keeps a real `<input>` — focusable, selectable,
submitted the same way — and only refuses new text. Reach for `readOnly` for a field
that is temporarily locked, `editable={false}` for one that was never meant to be
typed into. Under `editable={false}` the forwarded ref receives the trigger
`<button>`.

## On phones

Where the pointer is coarse, the picker gives up the caret as the calendar opens, so
the on-screen keyboard is gone before the panel is placed, and it does not take focus
back after a date is picked. Both avoid the keyboard covering the calendar — and,
worse, dismissing itself mid-tap, which moves the panel out from under the finger and
loses the tap.

The panel is measured against the visual viewport rather than `window.innerHeight`,
which on iOS stays at full height while the keyboard covers half the screen, and it
holds still for the length of any gesture that starts on it.

Under 640px the calendar is presented as a **bottom sheet** rather than anchored to
the trigger — that is `mode="auto"`, and it is the default for both the date picker
and the range picker. A panel anchored to a field near the bottom of a phone can only
flip and clamp, so it ends up squeezed against an edge; the range picker, being the
widest panel here, simply ran off the screen. Pass `mode="popover"` to anchor it
everywhere, or `mode="sheet"` to use a sheet at every width.

The sheet is full-bleed, dims the page behind it, and scrolls internally. Inside it
days grow to a 44px touch target, the range picker's months stack instead of sitting
side by side, and its presets become a horizontal strip. Tune it with
`--doran-sheet-bg`, `--doran-sheet-backdrop`, `--doran-sheet-radius`,
`--doran-sheet-padding`, `--doran-sheet-content-width`, and `--doran-day-size-touch`.

## Value types

`value`, `defaultValue`, `min`, and `max` accept a `DoranDate`, a native `Date`, epoch
milliseconds, or a string — Jalali or Gregorian, Latin or Persian digits.

```tsx
// onChange receives a string, typed as such.
<DoranDatePicker valueFormat="YYYY-MM-DD" onChange={setQueryParam} />
```

| `valueFormat`       | `onChange` receives                  |
| ------------------- | ------------------------------------ |
| `'doran'` (default) | `DoranDate`                          |
| `'date'`            | native `Date`                        |
| `'iso'`             | Gregorian UTC ISO string             |
| any other string    | that Jalali pattern, in Latin digits |

The second `onChange` argument is always the Gregorian `Date`. Pattern output uses
Latin digits, since it is bound for a query string or an API rather than the screen.

## Forms

The picker forwards its ref to the input and accepts `name`, `required`, `readOnly`,
`editable`, `invalid`, `onBlur`, and `aria-describedby`. A named picker submits through a hidden
input carrying a Latin-digit machine value.

```tsx
<Controller
  control={control}
  name="checkIn"
  render={({ field, fieldState }) => (
    <DoranDatePicker {...field} invalid={Boolean(fieldState.error)} />
  )}
/>
```

`{...field}` supplies `value`, `onChange`, `onBlur`, `name`, and `ref`. To keep plain
strings in the form, set `valueFormat` and use `register` instead.

## Styling parts

```tsx
<DoranDatePicker classNames={{ trigger: 'h-9', popover: 'shadow-xl' }} />
```

Slots are `root`, `trigger`, `input`, `icon`, `popover`, and `calendar`; your classes
merge with Doran's. `portalContainer` moves the pop-over out of `document.body` — pass
the dialog's element when the picker sits inside a focus-trapping dialog, since a
body-level pop-over falls outside the trap.

## Day widgets

Put your own content under each day — a fare, a seat count, an availability badge.

| Prop            | Type                                                | Description                                                            |
| --------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| `dayContent`    | `(day: DoranDate, meta: DayMeta) => ReactNode`      | Content rendered beneath the day number. Must be non-interactive.      |
| `dayProps`      | `(day: DoranDate, meta: DayMeta) => DayPropsResult` | Attributes merged onto the day button — `className`, `style`, `data-*` |
| `dayData`       | `Record<string, DayDatum>`                          | Serializable annotations keyed by Jalali `YYYY-M-D`                    |
| `disabledDates` | `(day: DoranDate) => boolean`                       | Blocks individual days on top of `min`/`max`                           |

```tsx
import { DoranDatePicker, dayKey } from '@doranjs/react';

<DoranDatePicker
  dayContent={(day) => <span>{fares[dayKey(day)]}</span>}
  dayProps={(day) => ({
    'data-cheapest': isCheapest(day) || undefined,
    label: `${fares[dayKey(day)]} toman`,
  })}
  disabledDates={(day) => soldOut(day)}
/>;
```

Two rules keep this accessible. **`dayContent` must be non-interactive** — the day
cell is itself a `<button>`, so a nested button or link is invalid HTML and breaks the
grid's keyboard model; put interactive content in a slot. And **announce what you
render** — a day's `aria-label` replaces its text rather than adding to it, so custom
content is invisible to screen readers unless you return a `label` from `dayProps`.
`dayData` text is used automatically.

### dayData

A render function can't cross an HTML boundary, so there is also a serializable map.
It survives JSON, so it can come straight from an API response, and the same shape
works in Vue, Svelte, Angular, and plain HTML.

```tsx
<DoranDatePicker
  dayData={{
    '1404-5-12': { text: '1,200,000', tone: 'low' },
    '1404-5-14': { disabled: true, disabledReason: 'Sold out' },
  }}
/>
```

`DayDatum` accepts `text`, `tone`, `label`, `title`, `disabled`, and `disabledReason`.
Keys are Jalali `YYYY-M-D`; zero-padded and Persian-digit forms resolve to the same
day. `dayContent` wins where both supply content for one day.

Tones become `data-tone`: `low`/`positive` and `high`/`negative` are styled out of the
box, and any other value passes through for your own CSS.

### Blocked days

A blocked day carries `aria-disabled` rather than the `disabled` attribute, so it stays
focusable and can explain itself. Arrow navigation skips `min`/`max` gaps, which can
span decades, but lands on individually blocked days so the `disabledReason` is heard.

## Slots

`legend`, `aside`, and `footer` take your own content. Unlike `dayContent`, slot
content sits outside the day grid, so it may be fully interactive.

```tsx
<DoranCalendar
  slots={{
    legend: <FareLegend />,
    aside: <FlexibleDatesPanel />,
    footer: <SelectedFareSummary />,
  }}
/>
```

`useDoranCalendar()` gives that content the calendar's state and navigation — which is
what makes a slot more than decoration:

```tsx
function JumpThreeMonths() {
  const { year, month, setMonth } = useDoranCalendar();
  return <button onClick={() => setMonth({ year, month: month + 3 })}>+3 months</button>;
}
```

It exposes `year`, `month`, `today`, `locale`, `selected`, `range`, `isSelected`,
`isDisabled`, `select`, `selectRange`, `clear`, `setMonth`, and the `goTo*` helpers.
Calling it outside a Doran calendar throws.

## Iranian holidays

```tsx
import { useHolidays } from '@doranjs/react/holidays';

const holidays = useHolidays();

<DoranDatePicker isHoliday={holidays.isHoliday} dayProps={holidays.dayProps} />;
```

A subpath export, so the holiday dataset only enters bundles that import it. It also
indexes each year once — `getHolidaysOn()` re-resolves a whole year per call, which a
month grid would do 42 times per render.

`isHoliday` counts only official public holidays by default; pass `officialOnly: false`
for observances. Lunar dates outside the years Iran has officially announced are
computed arithmetically and may land a day either side — those carry `data-approximate`.

## Theming

Every part reads its own CSS variable, so you can restyle a single instance without
overriding components — colors, fonts, shadows, borders, radii, and arrows:

```tsx
<div style={{ '--doran-day-selected-bg': '#e11d48', '--doran-calendar-radius': '22px' }}>
  <DoranCalendar />
</div>
```

See [`@doranjs/ui`](/en/api/ui) for the full token list.

## Headless primitives

```tsx
import { useCalendar, useDateRange, buildMonthGrid } from '@doranjs/react';

const { grid, goToNextMonth, select, isSelected } = useCalendar();
const grid = buildMonthGrid(1405, 3); // pure, no React
```

All components support keyboard navigation (arrows, Home/End, Enter/Space), ARIA grid
semantics, dark mode, and mobile layouts.

## Range picker with a trigger

`DoranRangeDatePicker` is one trigger holding two fields, either typable or fillable
from the grid:

```tsx
<DoranRangeDatePicker value={range} onChange={setRange} numberOfMonths={2} presets />
```

The ends are kept in order — an end before the start swaps them. `startName` and
`endName` emit hidden fields carrying Latin-digit dates for native form submission.
`DoranRangePicker` remains the inline version with no trigger.

## Time picker

Every field is typable as well as steppable, and each unit has its own step, all
defaulting to `1`:

```tsx
<DoranDatePicker withTime withSeconds hourCycle={12} minuteStep={15} />
```

| Prop          | Default | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| `hourStep`    | `1`     | How far one arrow press moves the hour      |
| `minuteStep`  | `1`     | …the minute                                 |
| `secondStep`  | `1`     | …the second                                 |
| `withSeconds` | `false` | Adds a seconds field                        |
| `hourCycle`   | `24`    | `12` adds a meridiem toggle from the locale |
| `readOnly`    | —       | Stops typing, keeps the steppers            |

## Presentation

```tsx
<DoranDatePicker mode="auto" />
```

`auto` switches to a bottom sheet under 640px, `sheet` forces it, `popover` (the
default) never uses it.
