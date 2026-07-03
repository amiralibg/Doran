import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoranNlpInput } from '@doranjs/angular';

// Type natural Persian like «پنجشنبهٔ بعد ساعت ۵»; a live preview of the parsed
// date appears beneath the input. The form value is the text string.
@Component({
  selector: 'demo-nlp-default',
  standalone: true,
  imports: [ReactiveFormsModule, DoranNlpInput],
  template: `<dr-nlp-input
    [formControl]="value"
    [locale]="lang()"
    placeholder="مثلاً: فردا ساعت ۹ صبح"
  />`,
})
export class NlpDefault {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly value = new FormControl('پنجشنبهٔ بعد ساعت ۵');
}
