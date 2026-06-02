# @doranjs/ui

## 0.0.2

### Patch Changes

- [`0909f80`](https://github.com/amiralibg/Doran/commit/0909f80cbf5e17e1ac3b2c20f7a688e9414ab2c0) Thanks [@amiralibg](https://github.com/amiralibg)! - Polish the UI layer and make it deeply themeable:
  - `@doranjs/ui` — expanded design tokens (per-part colors, fonts, shadows, borders, and
    radii) plus an SVG icon set (`ChevronRightIcon`, `CalendarIcon`, …).
  - `@doranjs/react` — fixed the reversed RTL navigation arrows; polished day/selection/
    today/weekend/holiday colors and reworked the range band into a rounded pill. Added
    month/year/time selection (`headerMode`, `withTime`, `DoranTimePicker`), holiday and
    weekend highlighting, and a natural-language input (`DoranNlpInput` + `useNlpSuggest`).
    Every part is now overridable via component-level CSS variables.

## 0.0.1

### Patch Changes

- [`0909f80`](https://github.com/amiralibg/Doran/commit/0909f80cbf5e17e1ac3b2c20f7a688e9414ab2c0) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of the UI layer:
  - `@doranjs/ui` — a minimal, RTL-first design system with CSS-variable design tokens
    (light/dark), a `ThemeProvider`/`useTheme`, a `Button`, and a `cn` helper.
  - `@doranjs/react` — accessible, RTL-first calendar components (`DoranCalendar`,
    `DoranMonthView`, `DoranDatePicker`, `DoranRangePicker`, `DoranAgenda`) plus the
    headless `useCalendar`, `useDateRange`, and `buildMonthGrid` primitives.
