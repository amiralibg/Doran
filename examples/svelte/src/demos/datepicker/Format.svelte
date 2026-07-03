<script lang="ts">
  import { type DoranDate } from '@doranjs/core';
  import { DoranDatePicker } from '@doranjs/svelte';

  // format controls how the selected date is displayed; placeholder is the
  // empty-state hint. Starts empty so the placeholder is visible.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = null;
</script>

<DoranDatePicker bind:value locale={lang} format="YYYY/MM/DD" placeholder="۱۴۰۳/۰۱/۰۱" />
