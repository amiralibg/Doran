// Importing the package auto-registers <doran-calendar>, <doran-datepicker>,
// <doran-rangepicker>, <doran-nlp-input> and <doran-agenda>.
import '@doranjs/wc';
import '@doranjs/wc/styles.css';
import { DoranDate } from '@doranjs/core';
import { addWorkingDays, getHolidays, workingDaysBetween } from '@doranjs/holidays';
import { occurrences, parseDuration, parseRange, parseRecurrence } from '@doranjs/nlp';
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

// Working days + advanced NLP (ranges, durations, recurrence).
const today = DoranDate.now().startOf('day');
const workdayOut = document.getElementById('workday-out');
if (workdayOut) {
  const fifth = addWorkingDays(today, 5);
  const monthStart = today.startOf('month');
  const count = workingDaysBetween(monthStart, monthStart.addMonths(1));
  workdayOut.textContent =
    `۵ روز کاری بعد: ${fifth.format('dddd D MMMM YYYY')} — ` +
    `روزهای کاری ${today.format('MMMM')}: ${count.toLocaleString('fa-IR')} روز`;
}

const advOut = document.getElementById('advnlp-out');
if (advOut) {
  const range = parseRange('از ۵ تا ۱۰ فروردین');
  const duration = parseDuration('یک ساعت و نیم');
  const recurrence = parseRecurrence('هر دوشنبه');
  const mondays = recurrence ? occurrences(recurrence, today, 3) : [];
  const rangeText = range
    ? `${range.start.format('D MMMM')} تا ${range.end.format('D MMMM')}`
    : '—';
  advOut.textContent =
    `«از ۵ تا ۱۰ فروردین» → ${rangeText} | ` +
    `«یک ساعت و نیم» → ${duration ? `${duration.amount} ${duration.unit}` : '—'} | ` +
    `«هر دوشنبه» → ${mondays.map((d) => d.format('D MMMM')).join('، ')}`;
}

// Theme toggle on the documentElement (Doran tokens read [data-doran-theme]).
const toggle = document.getElementById('theme-toggle');
toggle?.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-doran-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-doran-theme', next);
  toggle.textContent = next === 'dark' ? '☀️ تم روشن' : '🌙 تم تیره';
});
