# @doranjs/svelte

Idiomatic **Svelte** bindings for Doran. Works with Svelte 4 and 5, including SvelteKit SSR. The
components are thin `bind:value` wrappers over the [`@doranjs/wc`](/en/api/wc) custom elements (the
shared engine), so the calendar/grid logic isn't reimplemented per framework. The change
convention matches [`@doranjs/react`](/en/api/react): `bind:value` carries a `DoranDate`, and the
`change` event **also** reports the Gregorian `Date`.

```bash
pnpm add @doranjs/svelte @doranjs/core svelte
```

```ts
// load the styles once (e.g. in your root layout)
import '@doranjs/wc/styles.css';
```

## Components

| Component          | `bind:value`                    | `change` detail                             |
| ------------------ | ------------------------------- | ------------------------------------------- |
| `DoranDatePicker`  | `DoranDate \| null`             | `{ value, gregorian: Date \| null }`        |
| `DoranCalendar`    | `DoranDate \| null`             | `{ value, gregorian: Date \| null }`        |
| `DoranRangePicker` | `{ start, end }` of `DoranDate` | `{ value, gregorian: { start, end } }`      |
| `DoranNlpInput`    | `string`                        | `resolve` / `change` with the parsed result |
| `DoranAgenda`      | —                               | `selectday` → `DoranDate`                   |

```svelte
<script lang="ts">
  import { DoranDatePicker } from '@doranjs/svelte';
  import type { DoranDate } from '@doranjs/core';

  let value: DoranDate | null = null;

  function onChange(e: CustomEvent<{ value: DoranDate | null; gregorian: Date | null }>) {
    // Post Gregorian ISO straight to your backend.
    if (e.detail.gregorian) {
      fetch('/api/save', { body: JSON.stringify({ at: e.detail.gregorian.toISOString() }) });
    }
  }
</script>

<DoranDatePicker bind:value locale="fa" on:change={onChange} />
{#if value}<p>{value.format('dddd D MMMM YYYY')}</p>{/if}
```

Any attribute the underlying element supports (`locale`, `placeholder`, `format`, `with-time`,
`min`, `max`, …) passes through via `$$restProps` — see [`@doranjs/wc`](/en/api/wc) for the full
list.

## Headless — `createCalendarGrid`

For fully custom markup, the store reuses the shared `buildMonthGrid` / `navigateFocus` from
`@doranjs/wc` — no per-framework grid logic:

```svelte
<script lang="ts">
  import { createCalendarGrid } from '@doranjs/svelte';
  const { cursor, grid, next, prev } = createCalendarGrid();
</script>

<button on:click={prev}>‹</button>
{#each $grid.weeks as week}
  {#each week as day}<span class:dim={!day.inCurrentMonth}>{day.day}</span>{/each}
{/each}
<button on:click={next}>›</button>
```

## SSR (SvelteKit)

The custom elements load client-side on mount (`@doranjs/wc` is SSR-guarded), so server rendering
emits the inert tag and hydration upgrades it. To keep digits/tz deterministic, wrap your app
(e.g. in `+layout.svelte`) in `DoranProvider` — it sets `locale`/`timeZone` for the subtree via
Svelte context, request-scoped (no mutable global):

```svelte
<script lang="ts">
  import { DoranProvider, DoranDatePicker } from '@doranjs/svelte';
</script>

<DoranProvider locale="fa" timeZone="Asia/Tehran">
  <DoranDatePicker />
</DoranProvider>
```

Components resolve locale as **explicit attr → provider**. See the [SSR guide](/en/guide/ssr).
