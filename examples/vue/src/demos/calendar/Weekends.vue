<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/vue';
import { shallowRef } from 'vue';

// weekends overrides which weekday indices are styled as weekend (0 = Saturday).
// The default is [6] (Friday); here we mark both Thursday and Friday.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(DoranDate.now());
</script>

<template>
  <DoranCalendar v-model="value" :locale="lang" weekends="5,6" />
</template>
