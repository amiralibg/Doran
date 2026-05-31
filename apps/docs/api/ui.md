# @doran/ui

A minimal, accessible, themeable design system.

```ts
import '@doran/ui/styles.css';
import { ThemeProvider, useTheme, Button, cn, tokens } from '@doran/ui';
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

## Components

- `Button` — `variant`: `primary | ghost | outline`, plus an `icon` mode.
- `cn(...values)` — a tiny `classNames` helper (drops falsy values like `clsx`).
