<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranCalendar } from '@doranjs/svelte';

  // header-mode="separate" renders native month and year <select>s instead of the
  // in-place dropdown panels.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = DoranDate.now();
</script>

<DoranCalendar bind:value locale={lang} header-mode="separate" />
