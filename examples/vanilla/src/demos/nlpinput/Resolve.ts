import { enUS, faIR } from '@doranjs/core';
import type { ParseResult } from '@doranjs/nlp';
import type { DoranNlpInputElement } from '@doranjs/wc';

// The `resolve` event hands you the parsed result (a DoranDate plus confidence)
// so you can use it in your app.
export default function Resolve(locale: string): HTMLElement {
  const L = locale === 'en' ? enUS : faIR;
  const wrap = document.createElement('div');

  const nlp = document.createElement('doran-nlp-input') as DoranNlpInputElement;
  nlp.setAttribute('locale', locale);
  nlp.value = 'فردا ساعت ۱۰';

  const out = document.createElement('p');
  out.className = 'result';
  out.textContent = '—';
  nlp.addEventListener('resolve', (e) => {
    const { result } = (e as CustomEvent<{ result: ParseResult | null }>).detail;
    out.textContent = result ? result.date.withLocale(L).format('dddd D MMMM YYYY — HH:mm') : '—';
  });

  wrap.append(nlp, out);
  return wrap;
}
