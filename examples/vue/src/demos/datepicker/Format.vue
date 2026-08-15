<script setup lang="ts">
import { type DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/vue';
import { shallowRef } from 'vue';

// format controls how the selected date is displayed — and how typing is masked:
// digits flow into this shape as they are entered, so here 14030101 becomes
// 1403-01-01. placeholder is the empty-state hint; the field starts empty so it
// is visible.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(null);
</script>

<template>
  <DoranDatePicker v-model="value" :locale="lang" format="YYYY-MM-DD" placeholder="۱۴۰۳-۰۱-۰۱" />
</template>
