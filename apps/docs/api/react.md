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
| `DoranAgenda`      | Vertical day-by-day agenda with events              |

```tsx
import { DoranCalendar, DoranDatePicker } from '@doranjs/react';

<DoranCalendar defaultValue={DoranDate.now()} onChange={(d) => ...} />
<DoranDatePicker placeholder="انتخاب تاریخ" />
```

## Headless primitives

```tsx
import { useCalendar, useDateRange, buildMonthGrid } from '@doranjs/react';

const { grid, goToNextMonth, select, isSelected } = useCalendar();
const grid = buildMonthGrid(1405, 3); // pure, no React
```

All components support keyboard navigation (arrows, Home/End, Enter/Space), ARIA grid
semantics, dark mode, and mobile layouts.
