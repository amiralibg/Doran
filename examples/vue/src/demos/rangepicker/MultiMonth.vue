<script setup lang="ts">
import { DoranRangePicker, type DoranDateRange } from '@doranjs/vue';
import { shallowRef } from 'vue';

// months renders several months side by side, easing the selection of longer ranges.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const range = shallowRef<DoranDateRange>({ start: null, end: null });
</script>

<template>
  <DoranRangePicker v-model="range" :locale="lang" months="2" />
</template>
