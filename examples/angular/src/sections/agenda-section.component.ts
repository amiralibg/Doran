import { Component, inject } from '@angular/core';
import { AppState } from '../i18n/app.service';
import { DemoCard } from '../demo/demo-card.component';
import { Section } from '../demo/section.component';
import { SOURCES } from '../generated-sources';
import { AgDefault } from '../demos/agenda/default.component';
import { AgDays } from '../demos/agenda/days.component';
import { AgCustomRender } from '../demos/agenda/custom-render.component';

@Component({
  selector: 'demo-agenda-section',
  standalone: true,
  imports: [Section, DemoCard, AgDefault, AgDays, AgCustomRender],
  template: `
    <demo-section id="agenda" [title]="'<DoranAgenda>'" [intro]="app.t('agIntro')">
      <demo-card
        [title]="app.t('agDefaultTitle')"
        [description]="app.t('agDefaultDesc')"
        [code]="src['agenda/default']"
        [wide]="true"
      >
        <demo-ag-default [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('agDaysTitle')"
        [description]="app.t('agDaysDesc')"
        [code]="src['agenda/days']"
      >
        <demo-ag-days [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('agRenderTitle')"
        [description]="app.t('agRenderDesc')"
        [code]="src['agenda/custom-render']"
      >
        <demo-ag-custom-render [lang]="app.lang()" />
      </demo-card>
    </demo-section>
  `,
})
export class AgendaSection {
  readonly app = inject(AppState);
  readonly src = SOURCES;
}
