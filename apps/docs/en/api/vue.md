# @doranjs/vue

Idiomatic **Vue 3** bindings for Doran. The components are thin `v-model` wrappers over the
[`@doranjs/wc`](/en/api/wc) custom elements (the shared engine), so the calendar/grid logic isn't
reimplemented per framework. The change convention matches [`@doranjs/react`](/en/api/react):
`v-model` carries a `DoranDate`, and the `change` event **also** emits the Gregorian `Date`.

```bash
pnpm add @doranjs/vue @doranjs/core vue
```

```ts
// main.ts — load the styles once
import '@doranjs/wc/styles.css';
```

## Components

| Component          | `v-model`                       | Extra `change` payload                      |
| ------------------ | ------------------------------- | ------------------------------------------- |
| `DoranDatePicker`  | `DoranDate \| null`             | Gregorian `Date \| null`                    |
| `DoranCalendar`    | `DoranDate \| null`             | Gregorian `Date \| null`                    |
| `DoranRangePicker` | `{ start, end }` of `DoranDate` | Gregorian `{ start, end }`                  |
| `DoranNlpInput`    | `string`                        | `resolve` / `change` with the parsed result |
| `DoranAgenda`      | —                               | `selectday(DoranDate)`                      |

```vue
<script setup lang="ts">
import { shallowRef } from 'vue';
import { DoranDatePicker } from '@doranjs/vue';
import type { DoranDate } from '@doranjs/core';

// shallowRef: DoranDate is immutable and must not be deep-proxied.
const date = shallowRef<DoranDate | null>(null);

function onChange(_doran: DoranDate | null, gregorian: Date | null) {
  // Post Gregorian ISO straight to your backend.
  if (gregorian) fetch('/api/save', { body: JSON.stringify({ at: gregorian.toISOString() }) });
}
</script>

<template>
  <DoranDatePicker v-model="date" locale="fa" @change="onChange" />
</template>
```

Any attribute the underlying element supports (`locale`, `placeholder`, `format`, `with-time`,
`min`, `max`, …) passes straight through — see [`@doranjs/wc`](/en/api/wc) for the full list.

## DatePicker and footer customization

```vue
<DoranDatePicker
  v-model="date"
  footer-actions="today,clear"
  icon-position="right"
  text-align="left"
  input-width="18rem"
  dropdown-width="trigger"
/>
```

`footer-actions` preserves the order of `today` and `clear`; an empty value
(`footer-actions=""`) hides the whole footer. Today selects the current date and updates
`v-model`/`change`; Clear emits `null` for both Doran and Gregorian values. RangePicker has a
Clear control by default, and an empty value hides its footer and range summary. `hide-footer` is
deprecated. Button labels follow the active locale: `fa` uses «امروز»/«پاک کردن», while `en` uses Today/Clear.

`icon-position` and `text-align` accept `left`/`right`. `input-width` is a CSS width;
`dropdown-width` accepts `auto` (intrinsic), `trigger` (match the input), or any CSS width such as
`24rem`. `disabled` disables the web component trigger, prevents opening, and closes an open
popover.

## Headless — `useCalendarGrid`

For fully custom markup, the composable reuses the shared `buildMonthGrid` / `navigateFocus` from
`@doranjs/wc` — no per-framework grid logic:

```ts
import { useCalendarGrid } from '@doranjs/vue';

const { cursor, grid, next, prev, move } = useCalendarGrid();
// grid.value.weeks → GridDay[][] (Saturday-first); next()/prev() step months.
```

## SSR

The custom elements load client-side on mount (`@doranjs/wc` is SSR-guarded), so server rendering
emits the inert tag and hydration upgrades it. To keep digits/tz deterministic, wrap your app in
`DoranProvider` — it sets `locale`/`timeZone` for the subtree via `provide`/`inject`,
request-scoped (no mutable global):

```vue
<script setup lang="ts">
import { DoranProvider, DoranDatePicker } from '@doranjs/vue';
</script>

<template>
  <DoranProvider locale="fa" timeZone="Asia/Tehran">
    <DoranDatePicker />
  </DoranProvider>
</template>
```

Components resolve locale as **explicit attr → provider**. See the [SSR guide](/en/guide/ssr) for
locale/timezone determinism.

## Day widgets and slots

`dayData` and `disabledDates` are declared props, because a map and a predicate cannot
travel as HTML attributes. Everything else passes through as an attribute.

```vue
<DoranCalendar v-model="value" :day-data="dayData" :disabled-dates="isBooked">
  <span slot="legend">Remaining capacity</span>
</DoranCalendar>
```

`legend`, `aside`, and `footer` are light-DOM slots forwarded straight to the element.

## Range picker with a trigger

```vue
<DoranRangeDatePicker v-model="range" presets months="2" />
```

One trigger holding two fields, either typable or fillable from the grid; the ends are
kept in order. `DoranRangePicker` remains the inline version.

## Time picker

`hour-step`, `minute-step`, `with-time`, and `readonly` are attributes. Every step
defaults to `1`, and each field can be typed into as well as stepped.

## Presentation

`mode="sheet"` — or `"auto"` under 640px — switches the pop-over to a bottom sheet.
