<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/vue';
import { shallowRef } from 'vue';

// The default calendar: dropdown month/year header, Saturday-first weeks, RTL.
// v-model carries a DoranDate; shallowRef keeps it un-proxied.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(DoranDate.now());
</script>

<template>
  <DoranCalendar v-model="value" :locale="lang" />
  <p v-if="value" class="result">{{ value.withLocale(lang).format('dddd D MMMM YYYY') }}</p>
</template>
