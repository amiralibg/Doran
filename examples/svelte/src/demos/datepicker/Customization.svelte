<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranDatePicker } from '@doranjs/svelte';

  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = DoranDate.now();
</script>

<DoranDatePicker
  bind:value
  locale={lang}
  footer-actions="today,clear"
  icon-position="right"
  text-align="left"
  input-width="18rem"
  dropdown-width="trigger"
/>
