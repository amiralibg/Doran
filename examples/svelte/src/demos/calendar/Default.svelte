<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranCalendar } from '@doranjs/svelte';

  // The default calendar: dropdown month/year header, Saturday-first weeks, RTL.
  // bind:value carries a DoranDate.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = DoranDate.now();
</script>

<DoranCalendar bind:value locale={lang} />
{#if value}<p class="result">{value.withLocale(lang).format('dddd D MMMM YYYY')}</p>{/if}
