<script setup lang="ts">
import { DoranRangePicker, type DoranDateRange } from '@doranjs/vue';
import { shallowRef } from 'vue';

// Click a start day, then an end day. v-model is a { start, end } of DoranDate.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const range = shallowRef<DoranDateRange>({ start: null, end: null });
</script>

<template>
  <DoranRangePicker v-model="range" :locale="lang" />
</template>
