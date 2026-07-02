<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/vue';
import { shallowRef } from 'vue';

// A date input that opens a calendar popover on click. v-model is a DoranDate.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(DoranDate.now());
</script>

<template>
  <DoranDatePicker v-model="value" :locale="lang" />
</template>
