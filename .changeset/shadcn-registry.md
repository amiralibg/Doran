---
'@doranjs/react': patch
---

Publish a shadcn/ui registry entry.

```bash
npx shadcn@latest add https://amiralibg.github.io/Doran/r/doran-date-picker.json
```

This installs a Jalali date picker built from the consumer's **own** Button, Input,
and Popover — no Doran stylesheet, no `doran-*` class names, nothing to theme around.
Doran supplies only the engine: `useCalendar` for month state and bounds,
`buildMonthGrid` for the Saturday-first grid, `navigateFocus` for arrow-key date maths,
and `parseJalali` so `1402/5/12` and `۱۴۰۲/۰۵/۱۲` both parse.

The installed component keeps the parts that are easy to get wrong: a `role="grid"`
with a roving tabindex, arrow keys that follow the writing direction, `aria-disabled`
on blocked days so they stay reachable, and a locale that drives direction as well as
month names.

The registry payload is generated from a real `.tsx` source that is type-checked in CI
against the published Doran types, so the shipped JSON cannot drift from a component
that no longer compiles.
