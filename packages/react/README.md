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
