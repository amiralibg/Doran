<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/vue';
import { shallowRef } from 'vue';

// Every part is styled by CSS variables. Override a handful of --doran-* tokens
// on a wrapper — no component overrides — and the same calendar restyles itself.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(DoranDate.now());
const rose = {
  '--doran-day-selected-bg': '#e11d48',
  '--doran-day-today-color': '#e11d48',
  '--doran-day-today-ring': '#fb7185',
  '--doran-day-hover-bg': '#fde7ec',
  '--doran-day-radius': '10px',
};
</script>

<template>
  <div :style="rose">
    <DoranCalendar v-model="value" :locale="lang" />
  </div>
</template>
