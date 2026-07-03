import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { AppState } from './i18n/app.service';
import { CalendarSection } from './sections/calendar-section.component';
import { DatePickerSection } from './sections/datepicker-section.component';
import { RangePickerSection } from './sections/rangepicker-section.component';
import { AgendaSection } from './sections/agenda-section.component';
import { NlpInputSection } from './sections/nlpinput-section.component';
import { ThemingSection } from './sections/theming-section.component';

const NAV = [
  { id: 'calendar', labelKey: 'navCalendar' },
  { id: 'datepicker', labelKey: 'navDatePicker' },
  { id: 'rangepicker', labelKey: 'navRangePicker' },
  { id: 'agenda', labelKey: 'navAgenda' },
  { id: 'nlp-input', labelKey: 'navNlpInput' },
  { id: 'theming', labelKey: 'navTheming' },
] as const;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CalendarSection,
    DatePickerSection,
    RangePickerSection,
    AgendaSection,
    NlpInputSection,
    ThemingSection,
  ],
  template: `
    <div class="app">
      <aside class="app__nav">
        <div class="app__brand">
          <span class="app__logo">دوران</span>
          <span class="app__brand-sub">{{ app.t('brandSub') }}</span>
        </div>
        <nav>
          @for (item of nav; track item.id) {
            <a
              [href]="'#' + item.id"
              [class]="
                item.id === active() ? 'app__nav-link app__nav-link--active' : 'app__nav-link'
              "
              [attr.aria-current]="item.id === active() ? 'true' : null"
            >
              {{ app.t(item.labelKey) }}
            </a>
          }
        </nav>
      </aside>

      <main class="app__main">
        <header class="app__header">
          <div>
            <h1 class="app__title">{{ app.t('headerTitle') }}</h1>
            <p class="app__subtitle">{{ app.t('headerSubtitle') }}</p>
          </div>
          <div class="app__actions">
            <button type="button" class="app__btn" (click)="app.toggleLang()">
              {{ app.lang() === 'fa' ? app.t('langToEn') : app.t('langToFa') }}
            </button>
            <button type="button" class="app__btn" (click)="app.toggleMode()">
              {{ app.mode() === 'light' ? app.t('themeToDark') : app.t('themeToLight') }}
            </button>
          </div>
        </header>

        <demo-calendar-section />
        <demo-datepicker-section />
        <demo-rangepicker-section />
        <demo-agenda-section />
        <demo-nlpinput-section />
        <demo-theming-section />
      </main>
    </div>
  `,
})
export class App {
  readonly app = inject(AppState);
  readonly nav = NAV;
  readonly active = signal<string>(NAV[0].id);

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Scroll-spy: highlight the nav link for the section currently near the top.
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          const inView = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (inView[0]) this.active.set(inView[0].target.id);
        },
        { rootMargin: '-15% 0px -75% 0px' },
      );
      for (const item of NAV) {
        const el = document.getElementById(item.id);
        if (el) observer.observe(el);
      }
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
