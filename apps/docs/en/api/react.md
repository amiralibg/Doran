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

| Prop              | Type                                         | Default              | Description                                                                      |
| ----------------- | -------------------------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| `value`           | `DoranDate \| null`                          | —                    | Controlled value                                                                 |
| `defaultValue`    | `DoranDate \| null`                          | —                    | Uncontrolled initial value                                                       |
| `onChange`        | `(date: DoranDate, gregorian: Date) => void` | —                    | Called on selection; second arg is the native `Date` for backend use             |
| `locale`          | `Locale \| string`                           | `getDefaultLocale()` | Formatting locale — falls back to the global default set by `setDefaultLocale()` |
| `format`          | `string`                                     | `'YYYY/MM/DD'`       | Display pattern (`+ 'HH:mm'` when `withTime`)                                    |
| `placeholder`     | `string`                                     | `'انتخاب تاریخ'`     | Input placeholder                                                                |
| `min`             | `DoranDate`                                  | —                    | Earliest selectable date                                                         |
| `max`             | `DoranDate`                                  | —                    | Latest selectable date                                                           |
| `disabled`        | `boolean`                                    | `false`              | Disables the input                                                               |
| `className`       | `string`                                     | —                    | Added to the root element                                                        |
| `style`           | `CSSProperties`                              | —                    | Inline style forwarded to the root element                                       |
| `id`              | `string`                                     | —                    | `id` forwarded to the root element                                               |
| `size`            | `'sm' \| 'md' \| 'lg'`                       | —                    | Preset heights: 32 / 40 / 48 px                                                  |
| `withTime`        | `boolean`                                    | `false`              | Show a time picker and carry the time on the value                               |
| `headerMode`      | `'dropdown' \| 'separate'`                   | `'dropdown'`         | In-place month/year panels, or native `<select>`s                                |
| `minuteStep`      | `number`                                     | `1`                  | Minute increment for the time stepper                                            |
| `isHoliday`       | `(day: DoranDate) => boolean`                | —                    | Mark holiday days (dot + holiday color)                                          |
| `weekends`        | `number[]`                                   | `[6]`                | Weekday indices treated as weekend (0 = Saturday)                                |
| `arrows`          | `{ prev, next }`                             | chevrons             | Custom navigation arrow nodes                                                    |
| `showOutsideDays` | `boolean`                                    | —                    | Show days from adjacent months in the grid                                       |

```tsx
// Minimal usage
<DoranDatePicker onChange={(d, gregorian) => console.log(gregorian.toISOString())} />;

// Controlled, with backend POST
const [date, setDate] = useState<DoranDate | null>(null);
<DoranDatePicker
  value={date}
  size="md"
  style={{ width: 200 }}
  onChange={(d, greg) => {
    setDate(d);
    await api.post('/events', { date: greg.toISOString() });
  }}
/>;

// Locale follows global default — call once at app root:
setDefaultLocale(enUS);
// Now every picker shows Latin digits and English month names with no extra prop.
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
