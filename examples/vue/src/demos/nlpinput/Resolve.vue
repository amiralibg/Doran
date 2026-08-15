<script setup lang="ts">
import { type ParseResult } from '@doranjs/nlp';
import { DoranNlpInput } from '@doranjs/vue';
import { ref, shallowRef } from 'vue';

// The `resolve` event hands you the parsed result (a DoranDate plus confidence)
// so you can use it in your app.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const text = ref('فردا ساعت ۱۰');
const result = shallowRef<ParseResult | null>(null);
</script>

<template>
  <DoranNlpInput
    v-model="text"
    :locale="lang"
    @resolve="(r) => (result = r as ParseResult | null)"
  />
  <p class="result">
    {{ result ? result.date.withLocale(lang).format('dddd D MMMM YYYY — HH:mm') : '—' }}
  </p>
</template>
