<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/vue';
import { shallowRef } from 'vue';

// with-time adds a time picker and carries the time-of-day on the selected value.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(DoranDate.now());
</script>

<template>
  <DoranCalendar v-model="value" :locale="lang" with-time />
  <p v-if="value" class="result">{{ value.withLocale(lang).format('dddd D MMMM YYYY — HH:mm') }}</p>
</template>
