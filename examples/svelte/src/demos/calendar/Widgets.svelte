<script lang="ts">
  import { DoranDate, dayKey, type DayDataMap } from '@doranjs/core';
  import { DoranCalendar } from '@doranjs/svelte';

  // Day widgets and slots work identically to React: `dayData` is a plain
  // serializable map, and `legend` is a light-DOM slot the wrapper forwards.
  export let lang: 'fa' | 'en' = 'fa';

  let value: DoranDate | null = null;

  const today = DoranDate.now().startOf('day');
  const dayData: DayDataMap = {};
  for (let offset = 0; offset < 45; offset += 1) {
    const day = today.addDays(offset);
    const seats = (offset * 5) % 12;
    dayData[dayKey(day)] = { text: String(seats), tone: seats <= 3 ? 'high' : 'low' };
  }
</script>

<DoranCalendar bind:value locale={lang} {dayData}>
  <span slot="legend">عدد زیر هر روز، ظرفیت باقی‌مانده است</span>
</DoranCalendar>
