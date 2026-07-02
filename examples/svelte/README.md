# Doran + Svelte example

Minimal Svelte + Vite app using [`@doranjs/svelte`](../../packages/svelte).

```bash
pnpm create vite doran-svelte --template svelte-ts
pnpm add @doranjs/svelte @doranjs/core svelte
```

`src/App.svelte`:

```svelte
<script lang="ts">
  import { DoranDatePicker, DoranRangePicker } from '@doranjs/svelte';
  import type { DoranDate } from '@doranjs/core';
  import type { DoranDateRange } from '@doranjs/svelte';
  import '@doranjs/wc/styles.css';

  let date: DoranDate | null = null;
  let range: DoranDateRange = { start: null, end: null };
</script>

<main dir="rtl">
  <h1>دوران × Svelte</h1>

  <DoranDatePicker bind:value={date} />
  {#if date}<p>{date.format('dddd D MMMM YYYY')} — {date.toISOString()}</p>{/if}

  <DoranRangePicker bind:value={range} on:change={(e) => console.log(e.detail.gregorian)} />
</main>
```

Run it with `pnpm dev`.
