<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranDatePicker } from '@doranjs/svelte';

  // A date input that opens a calendar popover on click. bind:value is a DoranDate.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = DoranDate.now();
</script>

<DoranDatePicker bind:value locale={lang} />
