import { enUS, faIR } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DoranCalendar } from './calendar';
import { DoranDatePicker } from './date-picker';
import { DoranRangeDatePicker } from './range-date-picker';

/**
 * Direction has to reach the navigation arrows, not just the layout.
 *
 * `DoranCalendar` resolved a direction and put it on its root, but never handed it to
 * `CalendarHeader` — whose own default is `'rtl'`. So the arrows pointed right-to-left
 * whatever the locale or `dir` said, and consumers papered over it by passing an
 * `arrows` pair chosen by hand. `DoranRangePicker` had always passed `direction` to the
 * same component; only this call site was missing it.
 *
 * The chevrons are distinguishable by path data, which is the only thing that changes
 * when direction flips — the aria-labels are identical either way.
 */
const RIGHT_CHEVRON = 'm9 18 6-6-6-6';
const LEFT_CHEVRON = 'm15 18-6-6 6-6';

/** The `d` of the prev/next arrows, in DOM order. */
function arrowPaths(root: ParentNode) {
  return Array.from(root.querySelectorAll('.doran-calendar__nav path')).map((p) =>
    p.getAttribute('d'),
  );
}

const openPicker = () => fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));

describe('direction reaches the calendar arrows', () => {
  it('points them back along an RTL locale', () => {
    const { container } = render(<DoranCalendar locale={faIR} />);
    const [prev, next] = arrowPaths(container);
    expect(prev).toBe(RIGHT_CHEVRON);
    expect(next).toBe(LEFT_CHEVRON);
  });

  it('flips them for an LTR locale', () => {
    const { container } = render(<DoranCalendar locale={enUS} />);
    const [prev, next] = arrowPaths(container);
    expect(prev).toBe(LEFT_CHEVRON);
    expect(next).toBe(RIGHT_CHEVRON);
  });

  it('lets an explicit dir override the locale', () => {
    const { container } = render(<DoranCalendar locale={faIR} dir="ltr" />);
    expect(arrowPaths(container)[0]).toBe(LEFT_CHEVRON);
    expect(container.querySelector('.doran-calendar')).toHaveAttribute('dir', 'ltr');
  });

  it('still honours an explicit arrows pair', () => {
    const { container } = render(
      <DoranCalendar locale={enUS} arrows={{ prev: <span data-testid="p" />, next: <span /> }} />,
    );
    expect(arrowPaths(container)).toEqual([]);
    expect(screen.getByTestId('p')).toBeInTheDocument();
  });
});

describe('pickers forward their direction to the calendar they open', () => {
  it('date picker: dir reaches the calendar, not just the pop-over', () => {
    render(<DoranDatePicker dir="ltr" />);
    openPicker();
    const dialog = screen.getByRole('dialog');
    // The pop-over already carried `dir`; the calendar inside it used to re-derive
    // its own from the locale and contradict the field it opened from.
    expect(dialog).toHaveAttribute('dir', 'ltr');
    expect(dialog.querySelector('.doran-calendar')).toHaveAttribute('dir', 'ltr');
    expect(arrowPaths(dialog)[0]).toBe(LEFT_CHEVRON);
  });

  it('date picker: an RTL default is unchanged', () => {
    render(<DoranDatePicker />);
    openPicker();
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('.doran-calendar')).toHaveAttribute('dir', 'rtl');
    expect(arrowPaths(dialog)[0]).toBe(RIGHT_CHEVRON);
  });

  it('range picker: dir reaches the calendar it opens', () => {
    render(<DoranRangeDatePicker dir="ltr" />);
    openPicker();
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('.doran-rangepicker')).toHaveAttribute('dir', 'ltr');
    expect(arrowPaths(dialog)[0]).toBe(LEFT_CHEVRON);
  });
});
