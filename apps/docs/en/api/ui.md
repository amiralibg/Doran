# @doranjs/ui

A minimal, accessible, themeable design system.

```ts
import '@doranjs/ui/styles.css';
import { ThemeProvider, useTheme, Button, cn, tokens } from '@doranjs/ui';
```

## Theming

```tsx
<ThemeProvider defaultMode="light" direction="rtl">
  <App />
</ThemeProvider>;

const { mode, toggleMode } = useTheme();
```

Design tokens are plain CSS variables (`--doran-primary`, `--doran-surface`, …) with
light and dark themes, so the system is Tailwind-compatible. Mirror them in JS via the
`tokens` export.

### Token groups

| Group   | Examples                                                                                    |
| ------- | ------------------------------------------------------------------------------------------- |
| Color   | `--doran-primary`, `--doran-surface`, `--doran-border`, `--doran-holiday`, `--doran-accent` |
| Radius  | `--doran-radius-sm \| md \| lg \| full`                                                     |
| Spacing | `--doran-space-xs \| sm \| md \| lg`                                                        |
| Font    | `--doran-font-sans`, `--doran-font-weight-medium \| semibold \| bold`                       |
| Shadow  | `--doran-shadow-sm \| md \| lg`                                                             |

Calendar components add granular per-part variables (e.g. `--doran-calendar-bg`,
`--doran-day-selected-bg`, `--doran-day-today-ring`, `--doran-calendar-arrow-color`,
`--doran-calendar-radius`, `--doran-calendar-shadow`) that all fall back to these
global tokens — override any of them on a single instance to restyle just that part.

## Components

- `Button` — `variant`: `primary | ghost | outline`, plus an `icon` mode.
- `cn(...values)` — a tiny `classNames` helper (drops falsy values like `clsx`).
- Icons — `ChevronRightIcon`, `ChevronLeftIcon`, `ChevronUpIcon`, `ChevronDownIcon`,
  `CalendarIcon`, `ClockIcon` (currentColor SVGs sized by `font-size`).
