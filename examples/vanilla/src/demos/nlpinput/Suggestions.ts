import type { DoranNlpInputElement } from '@doranjs/wc';

// `show-suggestions` surfaces completion suggestions under the input as you type.
export default function Suggestions(locale: string): HTMLElement {
  const nlp = document.createElement('doran-nlp-input') as DoranNlpInputElement;
  nlp.setAttribute('locale', locale);
  nlp.setAttribute('show-suggestions', '');
  nlp.setAttribute('placeholder', 'شروع به تایپ کنید…');
  nlp.value = 'هفتهٔ';
  return nlp;
}
