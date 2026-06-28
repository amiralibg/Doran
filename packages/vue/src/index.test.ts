import { DoranDate } from '@doranjs/core';
import { renderToString } from 'vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { describe, expect, it } from 'vitest';
import {
  DoranAgenda,
  DoranCalendar,
  DoranDatePicker,
  DoranNlpInput,
  DoranRangePicker,
} from './components';
import { useCalendarGrid } from './use-calendar-grid';

describe('useCalendarGrid', () => {
  it('builds a Saturday-first grid for the cursor month', () => {
    const start = DoranDate.fromJalali({ year: 1403, month: 1, day: 15 });
    const { cursor, grid } = useCalendarGrid(start);
    expect(cursor.value.year).toBe(1403);
    expect(grid.value.month).toBe(1);
    expect(grid.value.weeks.length).toBeGreaterThan(0);
    expect(grid.value.weeks[0]).toHaveLength(7);
  });

  it('steps months and recomputes the grid reactively', () => {
    const { cursor, grid, next, prev } = useCalendarGrid(
      DoranDate.fromJalali({ year: 1403, month: 1, day: 1 }),
    );
    next();
    expect(grid.value.month).toBe(2);
    prev();
    prev();
    expect(grid.value.month).toBe(12);
    expect(cursor.value.year).toBe(1402); // wrapped to the previous year
  });

  it('keeps the DoranDate un-proxied (private fields still work)', () => {
    const { cursor, next } = useCalendarGrid(
      DoranDate.fromJalali({ year: 1403, month: 5, day: 1 }),
    );
    next();
    // Would throw if Vue had wrapped the instance in a reactive proxy.
    expect(() => cursor.value.toISOString()).not.toThrow();
  });
});

describe('components render the right custom element (SSR)', () => {
  const cases = [
    ['DoranDatePicker', DoranDatePicker, 'doran-datepicker'],
    ['DoranCalendar', DoranCalendar, 'doran-calendar'],
    ['DoranRangePicker', DoranRangePicker, 'doran-rangepicker'],
    ['DoranNlpInput', DoranNlpInput, 'doran-nlp-input'],
    ['DoranAgenda', DoranAgenda, 'doran-agenda'],
  ] as const;

  it.each(cases)('%s → <%s>', async (_name, component, tag) => {
    const html = await renderToString(createSSRApp({ render: () => h(component) }));
    expect(html).toContain(`<${tag}`);
  });
});
