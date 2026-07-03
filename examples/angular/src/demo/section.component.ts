import { Component, input } from '@angular/core';

// Groups all demos for one component under a titled, anchorable section.
@Component({
  selector: 'demo-section',
  standalone: true,
  template: `
    <section [id]="id()" class="section">
      <header class="section__head">
        <h2 class="section__title">{{ title() }}</h2>
        @if (intro()) {
          <p class="section__intro">{{ intro() }}</p>
        }
      </header>
      <div class="section__grid"><ng-content /></div>
    </section>
  `,
})
export class Section {
  readonly id = input.required<string>();
  readonly title = input.required<string>();
  readonly intro = input<string>();
}
