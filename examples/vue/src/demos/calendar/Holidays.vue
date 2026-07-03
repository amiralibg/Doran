<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/vue';
import { shallowRef } from 'vue';

// show-holidays marks official-holiday days with a dot and the holiday color,
// wired to the built-in @doranjs/holidays data (no per-day callback needed).
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(DoranDate.now());
</script>

<template>
  <DoranCalendar v-model="value" :locale="lang" show-holidays />
</template>
