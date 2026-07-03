<script lang="ts">
  import { DoranDate } from '@doranjs/core';
  import { DoranAgenda } from '@doranjs/svelte';
  import type { AgendaEvent } from '@doranjs/wc';

  // `renderEvent` takes over the markup for each event, returning an HTML string —
  // here a colored pill with the title.
  export let lang: 'fa' | 'en' = 'fa';
  const start = DoranDate.now().startOf('day');
  const events: AgendaEvent[] = [
    { id: '1', date: start, title: 'طراحی', color: '#6366f1' },
    { id: '2', date: start.addDays(1), title: 'توسعه', color: '#10b981' },
  ];
  const renderEvent = (event: AgendaEvent) =>
    `<span style="display:inline-block;padding:.15rem .6rem;border-radius:999px;background:${event.color};color:#fff;font-size:.8rem">${event.title}</span>`;
</script>

<DoranAgenda {start} days={3} {events} {renderEvent} locale={lang} />
