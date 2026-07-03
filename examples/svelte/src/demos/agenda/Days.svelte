<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranAgenda } from '@doranjs/svelte';
  import type { AgendaEvent } from '@doranjs/wc';

  // `days` sets how many days to render — here a 3-day view starting today.
  export let lang: 'fa' | 'en' = 'fa';
  const start = DoranDate.now().startOf('day');
  const events: AgendaEvent[] = [
    { id: '1', date: start, title: 'امروز: تماس با مشتری', color: 'var(--doran-primary)' },
    { id: '2', date: start.addDays(2), title: 'پس‌فردا: انتشار گزارش' },
  ];
</script>

<DoranAgenda {start} days={3} {events} locale={lang} />
