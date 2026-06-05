---
'@doranjs/react': patch
'@doranjs/wc': patch
'@doranjs/ui': patch
---

Promote `@doranjs/react`, `@doranjs/wc`, and `@doranjs/ui` to stable. Each now ships a
full DOM-level test suite (rendering, interaction, keyboard a11y, and event contracts)
under `jsdom`, covering the calendar, date picker, range picker, time picker,
natural-language input, and agenda components/elements, the `useCalendar`/`useDateRange`
hooks, and the `Button`/`ThemeProvider` primitives. No runtime behavior changes.
