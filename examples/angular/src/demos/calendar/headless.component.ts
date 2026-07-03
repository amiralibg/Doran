import { Component, computed, input, signal } from '@angular/core';
import { DoranDate, resolveLocale } from '@doranjs/core';
import { createCalendarGrid } from '@doranjs/angular';

// Full control: skip <dr-calendar> and drive your own markup with the
// createCalendarGrid signal store. It reuses the shared month-grid logic — cursor
// is the month in view, grid.weeks the days — so navigation matches the components.
@Component({
  selector: 'demo-cal-headless',
  standalone: true,
  template: `
    <div class="hl-head">
      <button type="button" (click)="cal.prev()">‹</button>
      <strong>{{ heading() }}</strong>
      <button type="button" (click)="cal.next()">›</button>
    </div>
    <div class="hl-grid" role="grid">
      @for (w of weekdays(); track w) {
        <span class="hl-weekday">{{ w }}</span>
      }
      @for (week of cal.grid().weeks; track $index) {
        @for (cell of week; track cell.date.toISOString()) {
          <button
            type="button"
            class="hl-day"
            [class.hl-day--dim]="!cell.inCurrentMonth"
            [class.hl-day--sel]="isSelected(cell.date)"
            (click)="selected.set(cell.date)"
          >
            {{ cell.date.withLocale(lang()).format('D') }}
          </button>
        }
      }
    </div>
  `,
  styles: [
    `
      .hl-head {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .hl-head strong {
        flex: 1;
        text-align: center;
      }
      .hl-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }
      .hl-weekday {
        text-align: center;
        font-size: 0.75rem;
        color: var(--doran-text-muted);
        padding: 0.25rem 0;
      }
      .hl-day {
        border: 0;
        background: transparent;
        padding: 0.4rem 0;
        border-radius: 8px;
        cursor: pointer;
        color: var(--doran-text);
        font: inherit;
      }
      .hl-day:hover {
        background: var(--doran-surface-muted);
      }
      .hl-day--dim {
        opacity: 0.35;
      }
      .hl-day--sel {
        background: var(--doran-primary);
        color: #fff;
      }
    `,
  ],
})
export class CalHeadless {
  readonly lang = input<'fa' | 'en'>('fa');
  readonly cal = createCalendarGrid();
  readonly selected = signal<DoranDate>(DoranDate.now());
  readonly weekdays = computed(() => resolveLocale(this.lang()).weekdaysMin);
  readonly heading = computed(() => this.cal.cursor().withLocale(this.lang()).format('MMMM YYYY'));

  isSelected(d: DoranDate): boolean {
    return d.isSame(this.selected(), 'day');
  }
}
