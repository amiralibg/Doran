# @doran/react

> RTL-first, accessible React components for the Persian (Jalali) calendar.

## Install

```bash
pnpm add @doran/react @doran/core @doran/ui react react-dom
```

## Usage

```tsx
import '@doran/ui/styles.css';
import '@doran/react/styles.css';
import { DoranCalendar, DoranDatePicker } from '@doran/react';
import { DoranDate } from '@doran/core';

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

## Headless support

Every component is built on pure, headless primitives you can use directly to build
your own UI:

```tsx
import { useCalendar, buildMonthGrid } from '@doran/react';

const { grid, goToNextMonth, select, isSelected } = useCalendar();
// or, fully pure:
const grid = buildMonthGrid(1405, 3);
```

## Design goals

- **RTL-first** — weeks start on Saturday, layout flows right-to-left.
- **Accessible** — `role="grid"` semantics, `aria-*` labels, and full keyboard
  navigation (arrows, Home/End, Enter/Space).
- **Dark mode & theming** — inherits the `@doran/ui` token system.
- **Mobile responsive** and dependency-light.

## License

[MIT](../../LICENSE)
