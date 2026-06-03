import { getLang, onLangChange, setLang, t } from './i18n/lang';
import { getTheme, onThemeChange, toggleTheme } from './theme';
import { el } from './demo/dom';
import { calendarSection } from './sections/calendar';
import { datePickerSection } from './sections/datepicker';
import { rangePickerSection } from './sections/rangepicker';
import { agendaSection } from './sections/agenda';
import { nlpInputSection } from './sections/nlpinput';
import { themingSection } from './sections/theming';

// Each entry's `id` must match a <section id="…"> and `key` a dictionary key.
const NAV = [
  { id: 'calendar', key: 'navCalendar' },
  { id: 'datepicker', key: 'navDatePicker' },
  { id: 'rangepicker', key: 'navRangePicker' },
  { id: 'agenda', key: 'navAgenda' },
  { id: 'nlp-input', key: 'navNlpInput' },
  { id: 'theming', key: 'navTheming' },
] as const;

let navLinks: HTMLAnchorElement[] = [];

export function mountApp(root: HTMLElement): void {
  const app = el('div', 'app');
  app.append(buildNav(), buildMain());
  root.append(app);
  setupScrollSpy();
}

function buildNav(): HTMLElement {
  const aside = el('aside', 'app__nav');

  const brand = el('div', 'app__brand');
  const logo = el('span', 'app__logo');
  logo.textContent = 'دوران';
  const sub = el('span', 'app__brand-sub');
  sub.textContent = t('brandSub');
  brand.append(logo, sub);

  const nav = el('nav');
  navLinks = NAV.map((item) => {
    const a = el('a', 'app__nav-link');
    a.href = `#${item.id}`;
    a.dataset.id = item.id;
    a.dataset.key = item.key;
    a.textContent = t(item.key);
    nav.append(a);
    return a;
  });

  aside.append(brand, nav);
  onLangChange(() => {
    sub.textContent = t('brandSub');
    for (const a of navLinks) a.textContent = t(a.dataset.key!);
  });
  return aside;
}

function buildMain(): HTMLElement {
  const main = el('main', 'app__main');
  main.append(
    buildHeader(),
    calendarSection(),
    datePickerSection(),
    rangePickerSection(),
    agendaSection(),
    nlpInputSection(),
    themingSection(),
  );
  return main;
}

function buildHeader(): HTMLElement {
  const header = el('header', 'app__header');

  const left = el('div');
  const h1 = el('h1', 'app__title');
  h1.textContent = t('headerTitle');
  const subtitle = el('p', 'app__subtitle');
  subtitle.textContent = t('headerSubtitle');
  left.append(h1, subtitle);

  const actions = el('div', 'app__actions');
  const langBtn = el('button', 'app__btn');
  langBtn.type = 'button';
  langBtn.addEventListener('click', () => setLang(getLang() === 'fa' ? 'en' : 'fa'));
  const themeBtn = el('button', 'app__btn');
  themeBtn.type = 'button';
  themeBtn.addEventListener('click', () => toggleTheme());
  actions.append(langBtn, themeBtn);

  function syncButtons(): void {
    langBtn.textContent = getLang() === 'fa' ? t('langToEn') : t('langToFa');
    themeBtn.textContent = getTheme() === 'light' ? t('themeToDark') : t('themeToLight');
  }
  syncButtons();

  onLangChange(() => {
    h1.textContent = t('headerTitle');
    subtitle.textContent = t('headerSubtitle');
    syncButtons();
  });
  onThemeChange(syncButtons);

  header.append(left, actions);
  return header;
}

// Highlights the nav link for the section currently scrolled into view.
function setupScrollSpy(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      const inView = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (inView[0]) setActive(inView[0].target.id);
    },
    { rootMargin: '-15% 0px -75% 0px' },
  );
  for (const item of NAV) {
    const section = document.getElementById(item.id);
    if (section) observer.observe(section);
  }
}

function setActive(id: string): void {
  for (const a of navLinks) {
    a.classList.toggle('app__nav-link--active', a.dataset.id === id);
    if (a.dataset.id === id) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
}
