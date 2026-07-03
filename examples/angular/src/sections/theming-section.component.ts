import { Component, inject } from '@angular/core';
import { AppState } from '../i18n/app.service';
import { DemoCard } from '../demo/demo-card.component';
import { Section } from '../demo/section.component';
import { SOURCES } from '../generated-sources';
import { ThTokens } from '../demos/theming/tokens.component';

@Component({
  selector: 'demo-theming-section',
  standalone: true,
  imports: [Section, DemoCard, ThTokens],
  template: `
    <demo-section id="theming" [title]="app.t('navTheming')" [intro]="app.t('thIntro')">
      <demo-card
        [title]="app.t('thTokensTitle')"
        [description]="app.t('thTokensDesc')"
        [code]="src['theming/tokens']"
      >
        <demo-th-tokens [lang]="app.lang()" />
      </demo-card>
    </demo-section>
  `,
})
export class ThemingSection {
  readonly app = inject(AppState);
  readonly src = SOURCES;
}
