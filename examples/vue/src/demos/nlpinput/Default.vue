<script setup lang="ts">
import { DoranNlpInput } from '@doranjs/vue';
import { ref } from 'vue';

// Type natural Persian like «پنجشنبهٔ بعد ساعت ۵»; a live preview of the parsed
// date appears beneath the input. v-model is the text string.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const text = ref('پنجشنبهٔ بعد ساعت ۵');
</script>

<template>
  <DoranNlpInput v-model="text" :locale="lang" placeholder="مثلاً: فردا ساعت ۹ صبح" />
</template>
