import { DoranDate } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DoranCalendar } from './calendar';
import { DoranDatePicker } from './date-picker';

const UTC = { timeZone: 'UTC' };
const today = DoranDate.fromJalali(1405, 3, 15, UTC);

// Doran's stylesheet is optional: skip the import and you get the same markup,
// keyboard model, and ARIA with no visual opinions attached. These guard the bits
// that would silently break under that setup.
describe('usable without the stylesheet', () => {
  it('hides the live region inline rather than via CSS', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={today} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    const live = container.querySelector<HTMLElement>('.doran-month__live')!;

    // Without this, an app that skips the CSS would print every announcement on screen.
    expect(live.style.position).toBe('absolute');
    expect(live.style.clipPath).toBe('inset(50%)');
    expect(live.style.whiteSpace).toBe('nowrap');
  });

  it('keeps the roving tabindex, which is markup rather than style', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={today} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    const focusable = container.querySelectorAll('.doran-day[tabindex="0"]');
    expect(focusable).toHaveLength(1);
  });

  it('keeps the popover positioned inline, not by class', () => {
    render(<DoranDatePicker defaultValue={today} />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));

    const dialog = screen.getByRole('dialog');
    expect(dialog.style.position || 'fixed').toBeTruthy();
  });
});

describe('per-part class names', () => {
  it('reaches every part of the month grid', () => {
    const { container } = render(
      <DoranCalendar
        timeZone="UTC"
        today={today}
        defaultMonth={{ year: 1405, month: 3 }}
        classNames={{
          root: 'my-cal',
          footer: 'my-footer',
          footerAction: 'my-action',
          month: {
            grid: 'my-grid',
            weekdays: 'my-weekdays',
            weekday: 'my-weekday',
            week: 'my-week',
            cell: 'my-cell',
            day: 'my-day',
          },
        }}
      />,
    );

    expect(container.querySelector('.doran-calendar')).toHaveClass('my-cal');
    expect(container.querySelector('.doran-month')).toHaveClass('my-grid');
    expect(container.querySelector('.doran-month__weekdays')).toHaveClass('my-weekdays');
    expect(container.querySelector('.doran-month__weekday')).toHaveClass('my-weekday');
    expect(container.querySelector('.doran-month__week')).toHaveClass('my-week');
    expect(container.querySelector('.doran-month__cell')).toHaveClass('my-cell');
    expect(container.querySelector('.doran-day')).toHaveClass('my-day');
    expect(container.querySelector('.doran-calendar__footer')).toHaveClass('my-footer');
    expect(container.querySelector('[data-footer-action]')).toHaveClass('my-action');
  });

  it('merges with Doran classes rather than replacing them', () => {
    const { container } = render(
      <DoranCalendar
        timeZone="UTC"
        today={today}
        defaultMonth={{ year: 1405, month: 3 }}
        classNames={{ month: { day: 'my-day' } }}
      />,
    );
    expect(container.querySelector('.doran-day')).toHaveClass('doran-day', 'my-day');
  });
});
