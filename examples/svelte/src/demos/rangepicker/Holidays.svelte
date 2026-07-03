<script lang="ts">
  import { DoranRangePicker, type DoranDateRange } from '@doranjs/svelte';

  // The same holiday/weekend marking as the calendar — show-holidays and weekends
  // carry straight over to the range picker.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDateRange = { start: null, end: null };
</script>

<DoranRangePicker bind:value locale={lang} show-holidays weekends="5,6" />
