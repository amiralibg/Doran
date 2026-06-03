import type { DoranNlpInputElement } from '@doranjs/wc';

// Type natural Persian like «جمعه ساعت ۷ شب»; a live preview of the parsed date
// appears beneath the input (the hint is on by default).
export default function Default(locale: string): HTMLElement {
  const nlp = document.createElement('doran-nlp-input') as DoranNlpInputElement;
  nlp.setAttribute('locale', locale);
  nlp.setAttribute('placeholder', 'مثلاً: فردا ساعت ۹ صبح');
  nlp.value = 'جمعه ساعت ۷ شب';
  return nlp;
}
