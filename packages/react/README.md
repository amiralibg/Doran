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
