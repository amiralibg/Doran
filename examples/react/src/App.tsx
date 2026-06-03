import { ThemeProvider, useTheme } from '@doranjs/ui';
import { useEffect, useState } from 'react';
import { LangProvider, useLang } from './i18n/LangProvider';
import { dirFor, type Lang } from './i18n/strings';
import { CalendarSection } from './sections/CalendarSection';
import { DatePickerSection } from './sections/DatePickerSection';
import { RangePickerSection } from './sections/RangePickerSection';
import { AgendaSection } from './sections/AgendaSection';
import { NlpInputSection } from './sections/NlpInputSection';
import { TimePickerSection } from './sections/TimePickerSection';
import { ThemingSection } from './sections/ThemingSection';

// The side nav. Each entry's `id` must match a <Section id="…"> and `labelKey` a
// string key in the dictionary.
const NAV = [
  { id: 'calendar', labelKey: 'navCalendar' },
  { id: 'datepicker', labelKey: 'navDatePicker' },
  { id: 'rangepicker', labelKey: 'navRangePicker' },
  { id: 'agenda', labelKey: 'navAgenda' },
  { id: 'nlp-input', labelKey: 'navNlpInput' },
  { id: 'time-picker', labelKey: 'navTimePicker' },
  { id: 'theming', labelKey: 'navTheming' },
] as const;

// Stable list of section ids for the scroll-spy effect dependency.
const NAV_IDS = NAV.map((n) => n.id);

export function App() {
  const [lang, setLang] = useState<Lang>('fa');

  // Direction follows the language automatically: Persian is RTL, English is LTR.
  return (
    <LangProvider lang={lang} setLang={setLang}>
      <ThemeProvider defaultMode="light" direction={dirFor(lang)}>
        <Shell />
      </ThemeProvider>
    </LangProvider>
  );
}

// Highlights the nav link for the section currently scrolled into view. The
// rootMargin defines a thin band near the top of the viewport: whichever section
// occupies it is "active".
function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (inView[0]) setActive(inView[0].target.id);
      },
      { rootMargin: '-15% 0px -75% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function Shell() {
  const { mode, toggleMode } = useTheme();
  const { lang, setLang, t } = useLang();
  const active = useActiveSection(NAV_IDS);

  return (
    <div className="app">
      <aside className="app__nav">
        <div className="app__brand">
          <span className="app__logo">دوران</span>
          <span className="app__brand-sub">{t('brandSub')}</span>
        </div>
        <nav>
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={
                item.id === active ? 'app__nav-link app__nav-link--active' : 'app__nav-link'
              }
              aria-current={item.id === active ? 'true' : undefined}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>
      </aside>

      <main className="app__main">
        <header className="app__header">
          <div>
            <h1 className="app__title">{t('headerTitle')}</h1>
            <p className="app__subtitle">{t('headerSubtitle')}</p>
          </div>
          <div className="app__actions">
            <button
              type="button"
              className="app__btn"
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            >
              {lang === 'fa' ? t('langToEn') : t('langToFa')}
            </button>
            <button type="button" className="app__btn" onClick={toggleMode}>
              {mode === 'light' ? t('themeToDark') : t('themeToLight')}
            </button>
          </div>
        </header>

        <CalendarSection />
        <DatePickerSection />
        <RangePickerSection />
        <AgendaSection />
        <NlpInputSection />
        <TimePickerSection />
        <ThemingSection />
      </main>
    </div>
  );
}
