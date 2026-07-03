<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranCalendar } from '@doranjs/svelte';

  // weekends overrides which weekday indices are styled as weekend (0 = Saturday).
  // The default is [6] (Friday); here we mark both Thursday and Friday.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = DoranDate.now();
</script>

<DoranCalendar bind:value locale={lang} weekends="5,6" />
