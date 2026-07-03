import { Component, inject } from '@angular/core';
import { AppState } from '../i18n/app.service';
import { DemoCard } from '../demo/demo-card.component';
import { Section } from '../demo/section.component';
import { SOURCES } from '../generated-sources';
import { NlpDefault } from '../demos/nlpinput/default.component';
import { NlpResolve } from '../demos/nlpinput/resolve.component';

@Component({
  selector: 'demo-nlpinput-section',
  standalone: true,
  imports: [Section, DemoCard, NlpDefault, NlpResolve],
  template: `
    <demo-section id="nlp-input" [title]="'<DoranNlpInput>'" [intro]="app.t('nlpIntro')">
      <demo-card
        [title]="app.t('nlpDefaultTitle')"
        [description]="app.t('nlpDefaultDesc')"
        [code]="src['nlpinput/default']"
      >
        <demo-nlp-default [lang]="app.lang()" />
      </demo-card>
      <demo-card
        [title]="app.t('nlpResolveTitle')"
        [description]="app.t('nlpResolveDesc')"
        [code]="src['nlpinput/resolve']"
      >
        <demo-nlp-resolve [lang]="app.lang()" />
      </demo-card>
    </demo-section>
  `,
})
export class NlpInputSection {
  readonly app = inject(AppState);
  readonly src = SOURCES;
}
