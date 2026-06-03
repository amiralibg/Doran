import { onLangChange, t } from '../i18n/lang';
import { el } from './dom';

/**
 * Groups all demo cards for one component under a titled, anchorable section.
 * The title is the literal tag name; the intro is localized (and may hold HTML).
 */
export function createSection(
  id: string,
  title: string,
  introKey: string,
  cards: HTMLElement[],
): HTMLElement {
  const section = el('section', 'section');
  section.id = id;

  const head = el('div', 'section__head');
  const h2 = el('h2', 'section__title');
  h2.textContent = title;
  const intro = el('p', 'section__intro');
  intro.innerHTML = t(introKey);
  head.append(h2, intro);

  const grid = el('div', 'section__grid');
  grid.append(...cards);

  section.append(head, grid);
  onLangChange(() => {
    intro.innerHTML = t(introKey);
  });

  return section;
}
