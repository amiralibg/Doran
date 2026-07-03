<script lang="ts">
  import { type ParseResult } from '@doranjs/nlp';
  import { DoranNlpInput } from '@doranjs/svelte';

  // The `resolve` event hands you the parsed result (a DoranDate plus confidence)
  // so you can use it in your app.
  export let lang: 'fa' | 'en' = 'fa';
  let value = 'فردا ساعت ۱۰';
  let result: ParseResult | null = null;
</script>

<DoranNlpInput
  bind:value
  locale={lang}
  on:resolve={(e) => (result = e.detail as ParseResult | null)}
/>
<p class="result">
  {result ? result.date.withLocale(lang).format('dddd D MMMM YYYY — HH:mm') : '—'}
</p>
