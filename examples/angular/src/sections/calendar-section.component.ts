import { Component, inject } from '@angular/core';
import { AppState } from '../i18n/app.service';
import { DemoCard } from '../demo/demo-card.component';
import { Section } from '../demo/section.component';
import { SOURCES } from '../generated-sources';
import { CalDefault } from '../demos/calendar/default.component';
import { CalSeparateHeader } from '../demos/calendar/separate-header.component';
import { CalWithTime } from '../demos/calendar/with-time.component';
import { CalHolidays } from '../demos/calendar/holidays.component';
import { CalWeekends } from '../demos/calendar/weekends.component';
import { CalLocale } from '../demos/calendar/locale.component';
import { CalHeadless } from '../demos/calendar/headless.component';

@Component({
  selector: 'demo-calendar-section',
  standalone: true,
  imports: [
    Section,
    DemoCard,
    CalDefault,
    CalSeparateHeader,
    CalWithTime,
    CalHolidays,
    CalWeekends,
    CalLocale,
    CalHeadless,
  ],
  template: `
    <demo-section id="calendar" [title]="'<DoranCalendar>'" [intro]="app.t('calIntro')">
      <demo-card
        [title]="app.t('calDefaultTitle')"
        [description]="app.t('calDefaultDesc')"
        [code]="src['calendar/default']"
      >
        <demo-cal-default [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('calSeparateTitle')"
        [description]="app.t('calSeparateDesc')"
        [code]="src['calendar/separate-header']"
      >
        <demo-cal-separate-header [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('calTimeTitle')"
        [description]="app.t('calTimeDesc')"
        [code]="src['calendar/with-time']"
      >
        <demo-cal-with-time [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('calHolidaysTitle')"
        [description]="app.t('calHolidaysDesc')"
        [code]="src['calendar/holidays']"
      >
        <demo-cal-holidays [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('calWeekendsTitle')"
        [description]="app.t('calWeekendsDesc')"
        [code]="src['calendar/weekends']"
      >
        <demo-cal-weekends [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('calLocaleTitle')"
        [description]="app.t('calLocaleDesc')"
        [code]="src['calendar/locale']"
      >
        <demo-cal-locale />
      </demo-card>
      <demo-card
        [title]="app.t('calHeadlessTitle')"
        [description]="app.t('calHeadlessDesc')"
        [code]="src['calendar/headless']"
      >
        <demo-cal-headless [lang]="app.lang()" />
      </demo-card>
    </demo-section>
  `,
})
export class CalendarSection {
  readonly app = inject(AppState);
  readonly src = SOURCES;
}
