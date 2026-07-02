# @doranjs/vue

Idiomatic **Vue 3** bindings for [Doran](https://github.com/amiralibg/Doran) — the Persian (Jalali) calendar.

The components are thin `v-model` wrappers over the [`@doranjs/wc`](https://github.com/amiralibg/Doran/tree/main/packages/wc) custom elements (the shared engine), so the calendar/grid logic isn't reimplemented per framework. The change convention matches [`@doranjs/react`](https://github.com/amiralibg/Doran/tree/main/packages/react): `v-model` carries a `DoranDate`, and `change` **also** emits the Gregorian `Date`.

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

Any attribute the underlying element supports (`locale`, `placeholder`, `format`, `with-time`, `min`, `max`, …) passes straight through.

## Headless — `useCalendarGrid`

For fully custom markup, the composable reuses the shared `buildMonthGrid` / `navigateFocus` from `@doranjs/wc` — no per-framework grid logic:

```ts
import { useCalendarGrid } from '@doranjs/vue';

const { cursor, grid, next, prev, move } = useCalendarGrid();
// grid.value.weeks → GridDay[][] (Saturday-first); next()/prev() step months.
```

## SSR

The custom elements are loaded client-side on mount (`@doranjs/wc` is SSR-guarded), so server rendering emits the inert tag and hydration upgrades it. To keep digits/tz deterministic, wrap your app in `DoranProvider` — it sets `locale`/`timeZone` for the subtree via `provide`/`inject`, request-scoped (no mutable global):

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

Components resolve locale as **explicit attr → provider**. See the [SSR guide](https://github.com/amiralibg/Doran/blob/main/apps/docs/en/guide/ssr.md) for locale/timezone determinism.

---

> Part of the framework-bindings effort ([#22](https://github.com/amiralibg/Doran/issues/22)). Svelte and Angular bindings follow the same conventions.
