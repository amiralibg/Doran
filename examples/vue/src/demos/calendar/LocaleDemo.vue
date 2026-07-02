<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/vue';
import { shallowRef } from 'vue';

// The locale attribute switches the calendar's language. locale="en" renders
// English month/weekday names with Latin digits — the same component.
const value = shallowRef<DoranDate | null>(DoranDate.now());
</script>

<template>
  <DoranCalendar v-model="value" locale="en" />
  <p v-if="value" class="result">{{ value.withLocale('en').format('dddd D MMMM YYYY') }}</p>
</template>
