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

## DatePicker and footer customization

```svelte
<DoranDatePicker
  bind:value
  footer-actions="today,clear"
  icon-position="right"
  text-align="left"
  input-width="18rem"
  dropdown-width="trigger"
/>
```

`footer-actions` preserves the order of `today` and `clear`; an empty value
(`footer-actions=""`) hides the whole footer. Today selects the current date and updates
`bind:value`/`change`; Clear emits `null` for both Doran and Gregorian values. RangePicker has a
Clear control by default, and an empty value hides its footer and range summary. `hide-footer` is
deprecated. Button labels follow the active locale: `fa` uses «امروز»/«پاک کردن», while `en` uses Today/Clear.

`icon-position` and `text-align` accept `left`/`right`. `input-width` is a CSS width;
`dropdown-width` accepts `auto` (intrinsic), `trigger` (match the input), or any CSS width such as
`24rem`. `disabled` disables the web component trigger, prevents opening, and closes an open
popover.

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

## Day widgets and slots

`dayData` and `disabledDates` are declared props, because a map and a predicate cannot
travel as HTML attributes. Everything else passes through as an attribute.

```svelte
<DoranCalendar bind:value {dayData} disabledDates={isBooked}>
  <span slot="legend">Remaining capacity</span>
</DoranCalendar>
```

`legend`, `aside`, and `footer` are light-DOM slots forwarded straight to the element.

## Range picker with a trigger

```svelte
<DoranRangeDatePicker bind:value={range} presets months="2" />
```

One trigger holding two fields, either typable or fillable from the grid; the ends are
kept in order. `DoranRangePicker` remains the inline version.

## Time picker

`hour-step`, `minute-step`, `with-time`, and `readonly` are attributes. Every step
defaults to `1`, and each field can be typed into as well as stepped.

## Presentation

`mode="sheet"` — or `"auto"` under 640px — switches the pop-over to a bottom sheet.
