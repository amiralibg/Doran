<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranDatePicker } from '@doranjs/svelte';

  export let lang: 'fa' | 'en' = 'fa';
  let value: DoranDate | null = null;
</script>

<!-- The trigger becomes a button: the whole field opens the calendar and no
     on-screen keyboard ever appears over it. -->
<DoranDatePicker bind:value locale={lang} editable="false" mode="auto" input-width="14rem" />
