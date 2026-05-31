# @doran/ui

> Minimal, accessible, themeable design system for the Doran ecosystem.

Elegant, RTL-first primitives and design tokens inspired by Linear, Notion, and Raycast.

## Install

```bash
pnpm add @doran/ui react react-dom
```

## Usage

```tsx
import '@doran/ui/styles.css';
import { ThemeProvider, Button, useTheme } from '@doran/ui';

function App() {
  return (
    <ThemeProvider defaultMode="light" direction="rtl">
      <Toolbar />
    </ThemeProvider>
  );
}

function Toolbar() {
  const { toggleMode } = useTheme();
  return (
    <Button variant="primary" onClick={toggleMode}>
      تغییر تم
    </Button>
  );
}
```

## What's inside

- **Design tokens** — CSS custom properties for color, spacing, radius, and type,
  with light and dark themes. Mirror them in JS via the `tokens` export.
- **`ThemeProvider` / `useTheme`** — color-scheme + direction context, RTL-first.
- **`Button`** — primary / ghost / outline variants, with an icon mode.
- **`cn`** — a tiny dependency-free `classNames` helper.

The tokens are plain CSS variables, so the system is **Tailwind-compatible**: reference
`var(--doran-primary)` and friends directly in your Tailwind theme.

## License

[MIT](../../LICENSE)
