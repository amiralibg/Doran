<script setup lang="ts">
import { DoranRangePicker, type DoranDateRange } from '@doranjs/vue';
import { shallowRef } from 'vue';

// The same holiday/weekend marking as the calendar — show-holidays and weekends
// carry straight over to the range picker.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const range = shallowRef<DoranDateRange>({ start: null, end: null });
</script>

<template>
  <DoranRangePicker v-model="range" :locale="lang" show-holidays weekends="5,6" />
</template>
