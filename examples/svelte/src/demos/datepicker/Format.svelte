<script lang="ts">
  import { type DoranDate } from '@doranjs/core';
  import { DoranDatePicker } from '@doranjs/svelte';

  // format controls how the selected date is displayed — and how typing is masked:
  // digits flow into this shape as they are entered, so here 14030101 becomes
  // 1403-01-01. placeholder is the empty-state hint; the field starts empty so it
  // is visible.
  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = null;
</script>

<DoranDatePicker bind:value locale={lang} format="YYYY-MM-DD" placeholder="۱۴۰۳-۰۱-۰۱" />
