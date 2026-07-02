<script setup lang="ts">
import { DoranRangePicker, type DoranDateRange } from '@doranjs/vue';
import { shallowRef } from 'vue';

// The presets attribute adds shortcut buttons (last 7 days, this month, …) above
// the calendar, using the built-in set.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const range = shallowRef<DoranDateRange>({ start: null, end: null });
</script>

<template>
  <DoranRangePicker v-model="range" :locale="lang" presets />
</template>
