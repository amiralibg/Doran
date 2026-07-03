<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranCalendar } from '@doranjs/svelte';

  // with-time adds a time picker and carries the time-of-day on the selected value.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = DoranDate.now();
</script>

<DoranCalendar bind:value locale={lang} with-time />
{#if value}<p class="result">{value.withLocale(lang).format('dddd D MMMM YYYY — HH:mm')}</p>{/if}
