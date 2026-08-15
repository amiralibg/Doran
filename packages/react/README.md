# @doranjs/react

> RTL-first, accessible React components for the Persian (Jalali) calendar.

## Install

```bash
pnpm add @doranjs/react @doranjs/core @doranjs/ui react react-dom
```

## Usage

```tsx
import '@doranjs/ui/styles.css';
import '@doranjs/react/styles.css';
import { DoranCalendar, DoranDatePicker } from '@doranjs/react';
import { DoranDate } from '@doranjs/core';

function Example() {
  return (
    <>
      <DoranCalendar
        defaultValue={DoranDate.now()}
        onChange={(d) => console.log(d.format('YYYY/MM/DD'))}
      />
      <DoranDatePicker placeholder="تاریخ تولد" />
    </>
  );
}
```

## Components

| Component          | Description                                         |
| ------------------ | --------------------------------------------------- |
| `DoranCalendar`    | Full month calendar with header navigation          |
| `DoranMonthView`   | A single accessible month grid (the building block) |
| `DoranDatePicker`  | Input with a pop-over calendar                      |
| `DoranRangePicker` | Two-click date-range selection                      |
| `DoranAgenda`      | Vertical day-by-day agenda with events              |

## Typing a date

The trigger is a real text field, so a date can be typed as well as picked.
`1402/5/12`, `1402-5-12`, and `۱۴۰۲/۰۵/۱۲` all parse.

```tsx
<DoranDatePicker onChange={setDate} />
```

Errors surface on blur rather than per keystroke — en route to `1402/05/12` the value
passes through `1`, `14`, `140`, and flagging each would leave the field red the whole
time it is in use. Text that doesn't parse is kept and marked `aria-invalid` rather
than silently discarded; `onParseError` tells you when that happens.

Pass `readOnly` where a date must come from the grid: the field stays focusable and
readable, and the calendar still works.

The calendar opens on the icon button, on `ArrowDown`, and not on focus — which would
fight typing. It deliberately does not take focus when it opens, since that would pull
the caret out of the field; tab forward to reach the grid.

## Value types

`value`, `defaultValue`, `min`, and `max` accept a `DoranDate`, a native `Date`, epoch
milliseconds, or a string — Jalali or Gregorian, Latin or Persian digits. `valueFormat`
controls what comes back:

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

The second `onChange` argument is always the Gregorian `Date`, whatever the format.
Pattern output uses Latin digits deliberately — it is bound for a query string or an
API rather than the screen.

## Forms

The picker forwards its ref to the input and supports `name`, `required`, `readOnly`,
`invalid`, `onBlur`, and `aria-describedby`. A named picker submits through a hidden
input carrying a Latin-digit machine value, since the Persian-digit text on screen is
not something a backend can read.

With **react-hook-form**, use `Controller` when the form holds a `DoranDate`:

```tsx
<Controller
  control={control}
  name="checkIn"
  render={({ field, fieldState }) => (
    <DoranDatePicker
      {...field}
      invalid={Boolean(fieldState.error)}
      aria-describedby={fieldState.error ? 'checkIn-error' : undefined}
    />
  )}
/>
```

`{...field}` supplies `value`, `onChange`, `onBlur`, `name`, and `ref` — all five are
accepted. To keep plain strings in the form instead, set `valueFormat` and `register`
directly:

```tsx
<DoranDatePicker valueFormat="YYYY-MM-DD" {...register('checkIn')} />
```

Pair either with [`@doranjs/zod`](https://www.npmjs.com/package/@doranjs/zod) for
validation. Style the error state with `--doran-input-invalid-border-color`; the field
wrapper also carries `data-invalid`.

## Styling parts

`className` reaches the root. `classNames` reaches everything else:

```tsx
<DoranDatePicker classNames={{ trigger: 'h-9', popover: 'shadow-xl', calendar: 'p-1' }} />
```

Slots are `root`, `trigger`, `input`, `icon`, `popover`, and `calendar`. Your classes
are merged with Doran's rather than replacing them.

`portalContainer` moves the pop-over out of `document.body` — pass the dialog's element
when the picker lives inside a focus-trapping dialog (shadcn, Radix, Headless UI),
since a body-level pop-over sits outside the trap and gets focus pulled back out.

## Range picker with a trigger

`DoranRangeDatePicker` is one trigger holding two fields, either typable or fillable
from the grid:

```tsx
<DoranRangeDatePicker value={range} onChange={setRange} numberOfMonths={2} presets />
```

The ends are kept in order — typing or picking an end before the start swaps them
rather than producing a backwards range. `startName` and `endName` emit hidden fields
carrying Latin-digit dates for native form submission.

Use `DoranRangePicker` instead when you want the calendar inline with no trigger.

## Time picker

Each field is a `spinbutton`, so it is a tab stop that answers to the arrow keys,
PageUp/PageDown, and Home/End. The chevrons are pointer affordances and stay out of
the tab order.

```tsx
<DoranDatePicker withTime withSeconds hourCycle={12} minuteStep={15} />
```

`hourCycle={12}` adds a meridiem toggle labelled from the locale's `meridiem` pair;
the value stays 24-hour either way. Every field can be typed into as well as stepped,
and each unit has its own step — `hourStep`, `minuteStep`, and `secondStep` — all
defaulting to `1`, so `minuteStep={15}` leaves the hour moving one at a time.

## Mobile

```tsx
<DoranDatePicker mode="auto" />
```

`auto` switches to a bottom sheet under 640px, where a 320px calendar anchored near
the bottom of a phone viewport would otherwise be squeezed against an edge under the
on-screen keyboard. `sheet` forces it, `popover` (the default) never uses it. The
sheet dismisses on Escape and outside-click exactly as the pop-over does.

## Day widgets

Put your own content under each day — a fare, a seat count, an availability badge.

```tsx
import { DoranDatePicker, dayKey } from '@doranjs/react';

<DoranDatePicker
  dayContent={(day) => <span>{fares[dayKey(day)]}</span>}
  dayProps={(day, meta) => ({
    'data-cheapest': isCheapest(day) || undefined,
    label: `${fares[dayKey(day)]} تومان`, // appended to the day's accessible name
  })}
  disabledDates={(day) => soldOut(day)}
/>;
```

**`dayContent` must be non-interactive.** The day cell is itself a `<button>`, so a
nested button or link is invalid HTML and breaks the grid's keyboard model. Put
interactive content in a [slot](#slots) instead.

**Announce what you render.** A day's `aria-label` replaces its text rather than
adding to it, so custom content is invisible to screen readers unless you return a
`label` from `dayProps`. `dayData` text is used automatically.

`dayProps` also forwards any `data-*` attribute to the day button, which is the hook
for styling days from your own stylesheet without touching Doran's class names.

### `dayData` — the cross-framework path

A render function can't cross an HTML boundary, so there is also a plain serializable
map. It survives JSON, so it can come straight from an API response — and the same
shape works in Vue, Svelte, Angular, and plain HTML.

```tsx
<DoranDatePicker
  dayData={{
    '1404-5-12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' },
    '1404-5-14': { disabled: true, disabledReason: 'ظرفیت تکمیل' },
  }}
/>
```

Keys are Jalali `YYYY-M-D`. Zero-padded and Persian-digit forms (`'1404/05/12'`,
`'۱۴۰۴/۰۵/۱۲'`) resolve to the same day. `dayContent` wins where both supply content.

Tones map to `data-tone` on the annotation. `low`/`positive` and `high`/`negative`
are styled out of the box; any other value passes through for your own CSS.

### Blocked days

`disabledDates` blocks individual days on top of `min`/`max`. A blocked day carries
`aria-disabled` rather than the `disabled` attribute, so it stays focusable and can
explain itself — arrow navigation skips `min`/`max` gaps, which can span decades, but
lands on individually blocked days so the `disabledReason` is actually heard.

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

`useDoranCalendar()` gives slot content the calendar's state and navigation, which is
what makes a slot more than decoration:

```tsx
function JumpThreeMonths() {
  const { year, month, setMonth } = useDoranCalendar();
  return <button onClick={() => setMonth({ year, month: month + 3 })}>+۳ ماه</button>;
}
```

It exposes `year`, `month`, `today`, `locale`, `selected`, `range`, `isSelected`,
`isDisabled`, `select`, `selectRange`, `clear`, `setMonth`, and the `goTo*` helpers.

In `@doranjs/wc` — and therefore Vue, Svelte, and Angular — the same regions are
light-DOM slots:

```html
<doran-datepicker>
  <div slot="legend">…</div>
</doran-datepicker>
```

## Iranian holidays

```tsx
import { useHolidays } from '@doranjs/react/holidays';

const holidays = useHolidays();

<DoranDatePicker isHoliday={holidays.isHoliday} dayProps={holidays.dayProps} />;
```

This is a subpath export, so the holiday dataset only enters bundles that import it.
`dayProps` adds the holiday name as a tooltip and to the day's accessible name.

Two caveats worth knowing: `isHoliday` counts only official public holidays by default
(pass `officialOnly: false` for observances), and lunar dates outside the years Iran
has officially announced are computed arithmetically and may land a day either side —
those carry `data-approximate`.

Iran announces religious holidays by moon sighting, so no library can compute them
exactly in advance. Ask which years are announced rather than presenting an estimate
as fact:

```tsx
const { official } = holidays.coverage(year);
if (!official) return <p>تعطیلات مذهبی این سال تخمینی است.</p>;
```

Feed your own announced dates with `registerOfficialLunarYear` from
`@doranjs/holidays`.

## Using it without the stylesheet

Skip the `@doranjs/react/styles.css` import and you keep the markup, the keyboard
model, and the ARIA with no visual opinions attached. Style the parts with
`classNames`, which `DoranDatePicker`, `DoranCalendar`, and `DoranMonthView` all
accept:

```tsx
<DoranCalendar classNames={{ root: 'rounded-xl border', month: { day: 'size-8 rounded-md' } }} />
```

Or install a picker built entirely from your own shadcn/ui components:

```bash
npx shadcn@latest add https://amiralibg.github.io/Doran/r/doran-date-picker.json
```

## Headless support

Every component is built on pure, headless primitives you can use directly to build
your own UI:

```tsx
import { useCalendar, buildMonthGrid } from '@doranjs/react';

const { grid, goToNextMonth, select, isSelected } = useCalendar();
// or, fully pure:
const grid = buildMonthGrid(1405, 3);
```

## SSR (Next.js)

Locale (Persian vs Latin digits) and time zone can differ between server and client, causing hydration mismatches. Wrap your app in `DoranProvider` to set subtree defaults **request-scoped** — unlike the mutable global `setDefaultLocale()`, it's SSR-safe:

```tsx
import { DoranProvider, DoranDatePicker } from '@doranjs/react';
import { faIR } from '@doranjs/core';

<DoranProvider locale={faIR} timeZone="Asia/Tehran">
  <DoranDatePicker />
</DoranProvider>;
```

Components resolve locale as **explicit prop → provider → global default**. See the [SSR guide](https://github.com/amiralibg/Doran/blob/main/apps/docs/en/guide/ssr.md).

## Design goals

- **RTL-first** — weeks start on Saturday, layout flows right-to-left.
- **Accessible** — `role="grid"` semantics, `aria-*` labels, and full keyboard
  navigation (arrows, Home/End, Enter/Space).
- **Dark mode & theming** — inherits the `@doranjs/ui` token system.
- **Mobile responsive** and dependency-light.

## License

[MIT](../../LICENSE)
