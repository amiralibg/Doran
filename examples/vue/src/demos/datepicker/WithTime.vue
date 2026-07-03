<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/vue';
import { shallowRef } from 'vue';

// with-time adds a time picker to the popover; a custom display format shows the
// time alongside the date.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(DoranDate.now());
</script>

<template>
  <DoranDatePicker v-model="value" :locale="lang" with-time format="dddd D MMMM YYYY — HH:mm" />
</template>
