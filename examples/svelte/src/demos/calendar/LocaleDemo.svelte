<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranCalendar } from '@doranjs/svelte';

  // The locale attribute switches the calendar's language. locale="en" renders
  // English month/weekday names with Latin digits — the same component.
  let value: DoranDate | null = DoranDate.now();
</script>

<DoranCalendar bind:value locale="en" />
{#if value}<p class="result">{value.withLocale('en').format('dddd D MMMM YYYY')}</p>{/if}
