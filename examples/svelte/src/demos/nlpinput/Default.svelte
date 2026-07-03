<script lang="ts">
  import { DoranNlpInput } from '@doranjs/svelte';

  // Type natural Persian like «پنجشنبهٔ بعد ساعت ۵»; a live preview of the parsed
  // date appears beneath the input. bind:value is the text string.
  export let lang: 'fa' | 'en' = 'fa';
  let value = 'پنجشنبهٔ بعد ساعت ۵';
</script>

<DoranNlpInput bind:value locale={lang} placeholder="مثلاً: فردا ساعت ۹ صبح" />
