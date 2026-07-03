<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranCalendar } from '@doranjs/svelte';

  // Every part is styled by CSS variables. Override a handful of --doran-* tokens
  // on a wrapper — no component overrides — and the same calendar restyles itself.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = DoranDate.now();
</script>

<div
  style="--doran-day-selected-bg:#e11d48;--doran-day-today-color:#e11d48;--doran-day-today-ring:#fb7185;--doran-day-hover-bg:#fde7ec;--doran-day-radius:10px"
>
  <DoranCalendar bind:value locale={lang} />
</div>
