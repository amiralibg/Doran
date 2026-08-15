<script setup lang="ts">
import { DoranRangeDatePicker, type DoranDateRange } from '@doranjs/vue';
import { shallowRef } from 'vue';

// The web-component counterpart of React's DoranRangeDatePicker: one trigger holding
// two fields, either typable or fillable from the grid. The ends are kept in order.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const range = shallowRef<DoranDateRange>({ start: null, end: null });
</script>

<template>
  <DoranRangeDatePicker v-model="range" :locale="lang" presets months="2" />
</template>
