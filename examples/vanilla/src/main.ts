// Importing the package auto-registers <doran-calendar>, <doran-datepicker>,
// <doran-rangepicker>, <doran-nlp-input> and <doran-agenda>.
import '@doranjs/wc';
import '@doranjs/wc/styles.css';
import { DoranDate } from '@doranjs/core';
import { getHolidays } from '@doranjs/holidays';
import type { DoranAgendaElement } from '@doranjs/wc';

// Calendar change → show the selected date.
const cal = document.getElementById('cal');
const calOut = document.getElementById('cal-out');
cal?.addEventListener('change', (e) => {
  const detail = (e as CustomEvent).detail as { value: string };
  if (calOut) calOut.textContent = `انتخاب‌شده: ${detail.value}`;
});

// NLP resolve → show the parsed date.
const nlpOut = document.getElementById('nlp-out');
document.querySelector('doran-nlp-input')?.addEventListener('resolve', (e) => {
  const detail = (e as CustomEvent).detail as {
    result: { date: { format(p: string): string } } | null;
  };
  if (!nlpOut) return;
  nlpOut.textContent = detail.result
    ? `تشخیص: ${detail.result.date.format('dddd D MMMM YYYY — HH:mm')}`
    : 'قابل تشخیص نیست';
});

// Agenda: feed this week starting Saturday, with the year's official holidays as events.
const agenda = document.getElementById('agenda') as DoranAgendaElement | null;
const agendaOut = document.getElementById('agenda-out');
if (agenda) {
  const weekStart = DoranDate.now().startOf('week');
  agenda.start = weekStart;
  agenda.events = getHolidays(weekStart.year)
    .filter((h) => h.official)
    .map((h, i) => ({
      id: String(i),
      date: DoranDate.fromJalali(h.year, h.month, h.day),
      title: h.title,
      description: h.titleEn,
      color: h.calendar === 'lunar' ? 'var(--doran-accent)' : 'var(--doran-primary)',
    }));
  agenda.addEventListener('selectday', (e) => {
    const { date } = (e as CustomEvent).detail as { date: DoranDate };
    if (agendaOut) agendaOut.textContent = `روز انتخاب‌شده: ${date.format('dddd D MMMM YYYY')}`;
  });
}

// Theme toggle on the documentElement (Doran tokens read [data-doran-theme]).
const toggle = document.getElementById('theme-toggle');
toggle?.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-doran-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-doran-theme', next);
  toggle.textContent = next === 'dark' ? '☀️ تم روشن' : '🌙 تم تیره';
});
