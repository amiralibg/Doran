<script setup lang="ts">
import { DoranDate, dayKey, type DayDataMap } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/vue';
import { computed, shallowRef } from 'vue';

// Day widgets and slots work identically to React: `dayData` is a plain serializable
// map, and `legend`/`aside`/`footer` are light-DOM slots the wrapper passes straight
// through to `<doran-calendar>`.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(null);

const dayData = computed<DayDataMap>(() => {
  const today = DoranDate.now().startOf('day');
  const data: DayDataMap = {};
  for (let offset = 0; offset < 45; offset += 1) {
    const day = today.addDays(offset);
    const seats = (offset * 5) % 12;
    data[dayKey(day)] = { text: String(seats), tone: seats <= 3 ? 'high' : 'low' };
  }
  return data;
});
</script>

<template>
  <DoranCalendar v-model="value" :locale="lang" :day-data="dayData">
    <span slot="legend">عدد زیر هر روز، ظرفیت باقی‌مانده است</span>
  </DoranCalendar>
</template>
