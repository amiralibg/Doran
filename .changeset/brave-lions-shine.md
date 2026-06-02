---
'@doranjs/ui': patch
'@doranjs/react': patch
---

Polish the UI layer and make it deeply themeable:

- `@doranjs/ui` — expanded design tokens (per-part colors, fonts, shadows, borders, and
  radii) plus an SVG icon set (`ChevronRightIcon`, `CalendarIcon`, …).
- `@doranjs/react` — fixed the reversed RTL navigation arrows; polished day/selection/
  today/weekend/holiday colors and reworked the range band into a rounded pill. Added
  month/year/time selection (`headerMode`, `withTime`, `DoranTimePicker`), holiday and
  weekend highlighting, and a natural-language input (`DoranNlpInput` + `useNlpSuggest`).
  Every part is now overridable via component-level CSS variables.
