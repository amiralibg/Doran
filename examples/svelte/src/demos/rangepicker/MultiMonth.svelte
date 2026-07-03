<script lang="ts">
  import { DoranRangePicker, type DoranDateRange } from '@doranjs/svelte';

  // months renders several months side by side, easing the selection of longer ranges.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDateRange = { start: null, end: null };
</script>

<DoranRangePicker bind:value locale={lang} months="2" />
