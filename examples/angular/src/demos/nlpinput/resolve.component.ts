import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { type ParseResult } from '@doranjs/nlp';
import { DoranNlpInput } from '@doranjs/angular';

// The (resolve) event hands you the parsed result (a DoranDate plus confidence)
// so you can use it in your app.
@Component({
  selector: 'demo-nlp-resolve',
  standalone: true,
  imports: [ReactiveFormsModule, DoranNlpInput],
  template: `
    <dr-nlp-input [formControl]="value" [locale]="lang()" (resolve)="onResolve($event)" />
    <p class="result">
      {{ result() ? result()!.date.withLocale(lang()).format('dddd D MMMM YYYY — HH:mm') : '—' }}
    </p>
  `,
})
export class NlpResolve {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl('فردا ساعت ۱۰');
  readonly result = signal<ParseResult | null>(null);

  onResolve(r: unknown): void {
    this.result.set(r as ParseResult | null);
  }
}
