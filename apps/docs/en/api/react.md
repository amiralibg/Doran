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
