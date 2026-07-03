<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranDatePicker } from '@doranjs/svelte';

  // with-time adds a time picker to the popover; a custom display format shows the
  // time alongside the date.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = DoranDate.now();
</script>

<DoranDatePicker bind:value locale={lang} with-time format="dddd D MMMM YYYY — HH:mm" />
