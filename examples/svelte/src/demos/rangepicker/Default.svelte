<script lang="ts">
  import { DoranRangePicker, type DoranDateRange } from '@doranjs/svelte';

  // Click a start day, then an end day. bind:value is a { start, end } of DoranDate.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDateRange = { start: null, end: null };
</script>

<DoranRangePicker bind:value locale={lang} />
