import { Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { AppState } from '../i18n/app.service';
import { CODE_THEMES, getHighlighter } from './highlighter';

// Renders a demo's source with Shiki highlighting and a copy button. The theme
// follows the app's light/dark mode; the code is always LTR.
@Component({
  selector: 'demo-code-panel',
  standalone: true,
  template: `
    <div class="code-panel" dir="ltr">
      <div class="code-panel__bar">
        <span class="code-panel__lang">{{ lang() }}</span>
        <button type="button" class="code-panel__copy" (click)="copy()">
          {{ copied() ? app.t('copied') : app.t('copy') }}
        </button>
      </div>
      @if (html()) {
        <div class="code-panel__shiki" [innerHTML]="html()"></div>
      } @else {
        <pre class="code-panel__pre"><code>{{ code().trimEnd() }}</code></pre>
      }
    </div>
  `,
})
export class CodePanel {
  readonly code = input.required<string>();
  readonly lang = input('angular-ts');
  readonly app = inject(AppState);
  private sanitizer = inject(DomSanitizer);
  readonly copied = signal(false);
  readonly html = signal<SafeHtml | ''>('');

  constructor() {
    effect(() => {
      const mode = this.app.mode();
      const code = this.code();
      const lang = this.lang();
      getHighlighter()
        .then((hl) => {
          const out = hl.codeToHtml(code.trimEnd(), {
            lang,
            theme: mode === 'dark' ? CODE_THEMES.dark : CODE_THEMES.light,
          });
          this.html.set(this.sanitizer.bypassSecurityTrustHtml(out));
        })
        .catch(() => this.html.set(''));
    });
  }

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
