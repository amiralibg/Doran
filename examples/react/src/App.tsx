import { DoranDate } from '@doran/core';
import { getHolidays } from '@doran/holidays';
import { parse } from '@doran/nlp';
import {
  DoranAgenda,
  DoranCalendar,
  DoranDatePicker,
  DoranRangePicker,
  type AgendaEvent,
} from '@doran/react';
import { Button, ThemeProvider, useTheme } from '@doran/ui';
import { useMemo, useState } from 'react';

export function App() {
  return (
    <ThemeProvider defaultMode="light" direction="rtl">
      <Shell />
    </ThemeProvider>
  );
}

function Shell() {
  const { mode, toggleMode } = useTheme();
  const [selected, setSelected] = useState<DoranDate>(DoranDate.now());
  const [query, setQuery] = useState('جمعه ساعت ۷ شب');

  const parsed = useMemo(() => parse(query), [query]);
  const holidays = useMemo(
    () => getHolidays(selected.year).filter((h) => h.official),
    [selected.year],
  );

  const events: AgendaEvent[] = holidays.slice(0, 5).map((h, i) => ({
    id: String(i),
    date: DoranDate.fromJalali(h.year, h.month, h.day),
    title: h.title,
    description: h.titleEn,
    color: h.calendar === 'lunar' ? 'var(--doran-accent)' : 'var(--doran-primary)',
  }));

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24, display: 'grid', gap: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>دوران</h1>
          <p style={{ margin: 0, color: 'var(--doran-text-muted)' }}>
            اکوسیستم متن‌باز تقویم فارسی
          </p>
        </div>
        <Button variant="outline" onClick={toggleMode}>
          {mode === 'light' ? '🌙 تم تیره' : '☀️ تم روشن'}
        </Button>
      </header>

      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h3>تقویم</h3>
          <DoranCalendar value={selected} onChange={setSelected} />
          <p>انتخاب‌شده: {selected.format('dddd D MMMM YYYY')}</p>
        </div>

        <div>
          <h3>انتخاب تاریخ</h3>
          <DoranDatePicker value={selected} onChange={setSelected} />

          <h3 style={{ marginTop: 24 }}>بازه تاریخ</h3>
          <DoranRangePicker />
        </div>
      </section>

      <section>
        <h3>پردازش زبان طبیعی</h3>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 360,
            padding: 8,
            borderRadius: 8,
            border: '1px solid var(--doran-border)',
            background: 'var(--doran-surface)',
            color: 'var(--doran-text)',
          }}
        />
        <p>
          {parsed
            ? `${parsed.date.format('dddd D MMMM YYYY — HH:mm')} (اطمینان: ${Math.round(parsed.confidence * 100)}٪)`
            : 'قابل تشخیص نیست'}
        </p>
      </section>

      <section>
        <h3>برنامه هفته (با تعطیلات رسمی)</h3>
        <DoranAgenda start={selected.startOf('week')} days={7} events={events} />
      </section>
    </main>
  );
}
