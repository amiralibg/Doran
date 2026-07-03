import { Component, inject, input, signal } from '@angular/core';
import { AppState } from '../i18n/app.service';
import { CodePanel } from './code-panel.component';

// A single demo: the live component (projected) on top, plus a one-click
// "show code" panel revealing the exact source (imported via `?raw`).
@Component({
  selector: 'demo-card',
  standalone: true,
  imports: [CodePanel],
  template: `
    <div [class]="wide() ? 'demo demo--wide' : 'demo'">
      <div class="demo__head">
        <div>
          <h3 class="demo__title">{{ title() }}</h3>
          @if (description()) {
            <p class="demo__desc">{{ description() }}</p>
          }
        </div>
        <button
          type="button"
          class="demo__toggle"
          [attr.aria-expanded]="showCode()"
          (click)="showCode.set(!showCode())"
        >
          {{ showCode() ? app.t('hideCode') : '‹ › ' + app.t('showCode') }}
        </button>
      </div>

      <div class="demo__preview"><ng-content /></div>

      @if (showCode()) {
        <demo-code-panel [code]="code()" />
      }
    </div>
  `,
})
export class DemoCard {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly code = input.required<string>();
  readonly wide = input(false);
  readonly app = inject(AppState);
  readonly showCode = signal(false);
}
