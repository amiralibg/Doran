<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranCalendar } from '@doranjs/svelte';

  // show-holidays marks official-holiday days with a dot and the holiday color,
  // wired to the built-in @doranjs/holidays data (no per-day callback needed).
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = DoranDate.now();
</script>

<DoranCalendar bind:value locale={lang} show-holidays />
