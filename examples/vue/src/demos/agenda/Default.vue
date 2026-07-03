<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranAgenda } from '@doranjs/vue';
import type { AgendaEvent } from '@doranjs/wc';

// One week of days starting Saturday, each with its events. `start` is the first
// day; `events` are placed on their `date`.
defineProps<{ lang?: 'fa' | 'en' }>();
const weekStart = DoranDate.now().startOf('week');
const events: AgendaEvent[] = [
  { id: '1', date: weekStart.addDays(1), title: 'جلسهٔ هفتگی تیم', color: 'var(--doran-primary)' },
  { id: '2', date: weekStart.addDays(1), title: 'بازبینی کد' },
  { id: '3', date: weekStart.addDays(3), title: 'تحویل نسخهٔ جدید', color: 'var(--doran-accent)' },
];
</script>

<template>
  <DoranAgenda :start="weekStart" :events="events" :locale="lang ?? 'fa'" />
</template>
