import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranAgenda, type AgendaEvent } from '@doranjs/react';

// `renderEvent` takes over the markup for each event — here a colored pill with
// the title.
export default function CustomRender({ locale = faIR }: { locale?: Locale }) {
  const start = DoranDate.now().startOf('day');
  const events: AgendaEvent[] = [
    { id: '1', date: start, title: 'طراحی', color: '#6366f1' },
    { id: '2', date: start.addDays(1), title: 'توسعه', color: '#10b981' },
  ];
  return (
    <DoranAgenda
      start={start}
      days={3}
      events={events}
      locale={locale}
      renderEvent={(event) => (
        <span
          style={{
            display: 'inline-block',
            padding: '0.15rem 0.6rem',
            borderRadius: '999px',
            background: event.color,
            color: '#fff',
            fontSize: '0.8rem',
          }}
        >
          {event.title}
        </span>
      )}
    />
  );
}
