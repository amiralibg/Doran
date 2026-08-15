<script lang="ts">
  import { DoranRangeDatePicker } from '@doranjs/svelte';
  import type { DoranDateRange } from '@doranjs/svelte';

  // The web-component counterpart of React's DoranRangeDatePicker: one trigger
  // holding two fields, either typable or fillable from the grid.
  export let lang: 'fa' | 'en' = 'fa';

  let value: DoranDateRange = { start: null, end: null };
</script>

<DoranRangeDatePicker bind:value locale={lang} presets months="2" />
