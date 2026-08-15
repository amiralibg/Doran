<script setup lang="ts">
import { type DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/vue';
import { shallowRef } from 'vue';

// format controls how the selected date is displayed; placeholder is the
// empty-state hint. Starts empty so the placeholder is visible.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(null);
</script>

<template>
  <DoranDatePicker v-model="value" :locale="lang" format="YYYY/MM/DD" placeholder="۱۴۰۳/۰۱/۰۱" />
</template>
