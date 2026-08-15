# shadcn/ui

Install a Persian date picker built from **your own** shadcn components:

```bash
npx shadcn@latest add https://amiralibg.github.io/Doran/r/doran-date-picker.json
```

It drops `components/ui/doran-date-picker.tsx` into your project and pulls in
`button`, `input`, and `popover` if you don't already have them.

## What you get

The component is yours — edit it like any other file under `components/ui`. Every
visual comes from your theme tokens and your primitives; Doran supplies only the
calendar engine:

- `useCalendar` for month state, selection, and `min`/`max` bounds
- `buildMonthGrid` for the Saturday-first Jalali month grid
- `navigateFocus` for the arrow-key date maths
- `parseJalali` so `1402/5/12`, `1402-5-12`, and `۱۴۰۲/۰۵/۱۲` all parse

No Doran stylesheet, no `doran-*` class names, nothing to theme around.

```tsx
import { DoranDatePicker } from '@/components/ui/doran-date-picker';

<DoranDatePicker value={value} onChange={setValue} />;
```

## Accessibility

The installed component keeps the parts that are easy to get wrong: a `role="grid"`
with a roving tabindex, arrow keys that follow the writing direction, `aria-disabled`
on blocked days so they stay reachable, and `aria-current="date"` on today.

## Locale

It reads the ambient locale, so `setDefaultLocale(enUS)` switches month names,
numerals, labels, **and** direction — including which way the navigation chevrons
point.

```tsx
import { enUS, setDefaultLocale } from '@doranjs/core';

setDefaultLocale(enUS);
```

## Prefer the packaged components?

If you'd rather not own the file, `@doranjs/react` ships the same picker fully built,
with day widgets, slots, range selection, and a time picker. See
[the React API](/en/api/react).
