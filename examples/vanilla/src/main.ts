// Importing the package auto-registers <doran-calendar>, <doran-datepicker>,
// <doran-rangepicker> and <doran-nlp-input>.
import '@doranjs/wc';
import '@doranjs/wc/styles.css';

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

// Theme toggle on the documentElement (Doran tokens read [data-doran-theme]).
const toggle = document.getElementById('theme-toggle');
toggle?.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-doran-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-doran-theme', next);
  toggle.textContent = next === 'dark' ? '☀️ تم روشن' : '🌙 تم تیره';
});
