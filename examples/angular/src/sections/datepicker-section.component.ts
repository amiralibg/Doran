import { Component, inject } from '@angular/core';
import { AppState } from '../i18n/app.service';
import { DemoCard } from '../demo/demo-card.component';
import { Section } from '../demo/section.component';
import { SOURCES } from '../generated-sources';
import { DpDefault } from '../demos/datepicker/default.component';
import { DpWithTime } from '../demos/datepicker/with-time.component';
import { DpFormat } from '../demos/datepicker/format.component';
import { DpCustomization } from '../demos/datepicker/customization.component';

@Component({
  selector: 'demo-datepicker-section',
  standalone: true,
  imports: [Section, DemoCard, DpDefault, DpWithTime, DpFormat, DpCustomization],
  template: `
    <demo-section id="datepicker" [title]="'<DoranDatePicker>'" [intro]="app.t('dpIntro')">
      <demo-card
        [title]="app.t('dpDefaultTitle')"
        [description]="app.t('dpDefaultDesc')"
        [code]="src['datepicker/default']"
      >
        <demo-dp-default [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('dpTimeTitle')"
        [description]="app.t('dpTimeDesc')"
        [code]="src['datepicker/with-time']"
      >
        <demo-dp-with-time [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('dpFormatTitle')"
        [description]="app.t('dpFormatDesc')"
        [code]="src['datepicker/format']"
      >
        <demo-dp-format [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('dpCustomizationTitle')"
        [description]="app.t('dpCustomizationDesc')"
        [code]="src['datepicker/customization']"
      >
        <demo-dp-customization [lang]="app.lang()" />
      </demo-card>
    </demo-section>
  `,
})
export class DatePickerSection {
  readonly app = inject(AppState);
  readonly src = SOURCES;
}
