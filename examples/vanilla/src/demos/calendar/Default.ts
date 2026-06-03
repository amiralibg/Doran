import { DoranDate, enUS, faIR } from '@doranjs/core';
import type { DoranCalendarElement } from '@doranjs/wc';

// The default calendar. Options are set as HTML attributes; the `change` event
// reports the selected date.
export default function Default(locale: string): HTMLElement {
  const L = locale === 'en' ? enUS : faIR;
  const wrap = document.createElement('div');

  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', locale);
  cal.value = DoranDate.now();

  const out = document.createElement('p');
  out.className = 'result';
  out.textContent = DoranDate.now().withLocale(L).format('dddd D MMMM YYYY');
  cal.addEventListener('change', (e) => {
    const { date } = (e as CustomEvent<{ date: DoranDate }>).detail;
    out.textContent = date.withLocale(L).format('dddd D MMMM YYYY');
  });

  wrap.append(cal, out);
  return wrap;
}
