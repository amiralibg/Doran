<script lang="ts">
  import { DoranRangePicker, type DoranDateRange } from '@doranjs/svelte';

  // The presets attribute adds shortcut buttons (last 7 days, this month, …) above
  // the calendar, using the built-in set.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDateRange = { start: null, end: null };
</script>

<DoranRangePicker bind:value locale={lang} presets />
