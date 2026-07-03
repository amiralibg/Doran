import { Component, inject } from '@angular/core';
import { AppState } from '../i18n/app.service';
import { DemoCard } from '../demo/demo-card.component';
import { Section } from '../demo/section.component';
import { SOURCES } from '../generated-sources';
import { RpDefault } from '../demos/rangepicker/default.component';
import { RpPresets } from '../demos/rangepicker/presets.component';
import { RpMultiMonth } from '../demos/rangepicker/multi-month.component';
import { RpHolidays } from '../demos/rangepicker/holidays.component';

@Component({
  selector: 'demo-rangepicker-section',
  standalone: true,
  imports: [Section, DemoCard, RpDefault, RpPresets, RpMultiMonth, RpHolidays],
  template: `
    <demo-section id="rangepicker" [title]="'<DoranRangePicker>'" [intro]="app.t('rpIntro')">
      <demo-card
        [title]="app.t('rpDefaultTitle')"
        [description]="app.t('rpDefaultDesc')"
        [code]="src['rangepicker/default']"
      >
        <demo-rp-default [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('rpPresetsTitle')"
        [description]="app.t('rpPresetsDesc')"
        [code]="src['rangepicker/presets']"
        [wide]="true"
      >
        <demo-rp-presets [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('rpMultiTitle')"
        [description]="app.t('rpMultiDesc')"
        [code]="src['rangepicker/multi-month']"
        [wide]="true"
      >
        <demo-rp-multi-month [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('rpHolidaysTitle')"
        [description]="app.t('rpHolidaysDesc')"
        [code]="src['rangepicker/holidays']"
      >
        <demo-rp-holidays [lang]="app.lang()" />
      </demo-card>
    </demo-section>
  `,
})
export class RangePickerSection {
  readonly app = inject(AppState);
  readonly src = SOURCES;
}
