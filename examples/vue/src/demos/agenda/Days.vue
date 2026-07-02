<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranAgenda } from '@doranjs/vue';
import type { AgendaEvent } from '@doranjs/wc';

// `days` sets how many days to render — here a 3-day view starting today.
defineProps<{ lang?: 'fa' | 'en' }>();
const start = DoranDate.now().startOf('day');
const events: AgendaEvent[] = [
  { id: '1', date: start, title: 'امروز: تماس با مشتری', color: 'var(--doran-primary)' },
  { id: '2', date: start.addDays(2), title: 'پس‌فردا: انتشار گزارش' },
];
</script>

<template>
  <DoranAgenda :start="start" :days="3" :events="events" :locale="lang ?? 'fa'" />
</template>
