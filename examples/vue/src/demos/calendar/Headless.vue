<script setup lang="ts">
import { DoranDate, resolveLocale } from '@doranjs/core';
import { useCalendarGrid } from '@doranjs/vue';
import { computed, shallowRef } from 'vue';

// Full control: skip <DoranCalendar> and drive your own markup with the
// useCalendarGrid composable. It reuses the shared month-grid logic — cursor is
// the month in view, grid.weeks the days — so navigation matches the components.
const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const { cursor, grid, next, prev } = useCalendarGrid();
const selected = shallowRef<DoranDate | null>(DoranDate.now());

const weekdays = computed(() => resolveLocale(lang).weekdaysMin);
const heading = computed(() => cursor.value.withLocale(lang).format('MMMM YYYY'));
const isSelected = (d: DoranDate) => selected.value != null && d.isSame(selected.value, 'day');
</script>

<template>
  <div>
    <div class="hl-head">
      <button type="button" @click="prev">‹</button>
      <strong>{{ heading }}</strong>
      <button type="button" @click="next">›</button>
    </div>
    <div class="hl-grid" role="grid">
      <span v-for="w in weekdays" :key="w" class="hl-weekday">{{ w }}</span>
      <template v-for="(week, i) in grid.weeks" :key="i">
        <button
          v-for="cell in week"
          :key="cell.date.toISOString()"
          type="button"
          class="hl-day"
          :class="{ 'hl-day--dim': !cell.inCurrentMonth, 'hl-day--sel': isSelected(cell.date) }"
          @click="selected = cell.date"
        >
          {{ cell.date.withLocale(lang).format('D') }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.hl-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.hl-head strong {
  flex: 1;
  text-align: center;
}
.hl-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.hl-weekday {
  text-align: center;
  font-size: 0.75rem;
  color: var(--doran-text-muted);
  padding: 0.25rem 0;
}
.hl-day {
  border: 0;
  background: transparent;
  padding: 0.4rem 0;
  border-radius: 8px;
  cursor: pointer;
  color: var(--doran-text);
  font: inherit;
}
.hl-day:hover {
  background: var(--doran-surface-muted);
}
.hl-day--dim {
  opacity: 0.35;
}
.hl-day--sel {
  background: var(--doran-primary);
  color: #fff;
}
</style>
