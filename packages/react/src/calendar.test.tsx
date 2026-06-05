import { DoranDate, faIR } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DoranCalendar } from './calendar';

const UTC = { timeZone: 'UTC' };
const today = DoranDate.fromJalali(1405, 3, 15, UTC);

function cell(container: HTMLElement, year: number, month: number, day: number) {
  return container.querySelector<HTMLButtonElement>(`[data-cell-date="${year}-${month}-${day}"]`)!;
}

// The month heading is the first `.doran-calendar__heading-btn`; day buttons also carry
// the month name in their aria-label, so query the heading by class, not by role+name.
function monthHeading(container: HTMLElement) {
  return container.querySelector<HTMLButtonElement>('.doran-calendar__heading-btn')!;
}

describe('DoranCalendar', () => {
  it('renders the current month in the header', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={today} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    expect(monthHeading(container)).toHaveTextContent(faIR.months[2]!);
  });

  it('navigates to the next and previous month', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={today} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'ماه بعد' }));
    expect(monthHeading(container)).toHaveTextContent(faIR.months[3]!);
    fireEvent.click(screen.getByRole('button', { name: 'ماه قبل' }));
    expect(monthHeading(container)).toHaveTextContent(faIR.months[2]!);
  });

  it('selects a day and calls onChange (uncontrolled)', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DoranCalendar
        timeZone="UTC"
        today={today}
        defaultMonth={{ year: 1405, month: 3 }}
        onChange={onChange}
      />,
    );
    fireEvent.click(cell(container, 1405, 3, 20));
    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0]![0] as DoranDate;
    expect([picked.year, picked.month, picked.day]).toEqual([1405, 3, 20]);
    expect(cell(container, 1405, 3, 20).closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('reflects a controlled value without self-updating on click', () => {
    const onChange = vi.fn();
    const value = DoranDate.fromJalali(1405, 3, 5, UTC);
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={today} value={value} onChange={onChange} />,
    );
    expect(cell(container, 1405, 3, 5).closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.click(cell(container, 1405, 3, 9));
    expect(onChange).toHaveBeenCalledTimes(1);
    // Still showing the controlled value, not the clicked one.
    expect(cell(container, 1405, 3, 9).closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('returns to today via the footer button after navigating away', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={today} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'ماه بعد' }));
    expect(monthHeading(container)).toHaveTextContent(faIR.months[3]!);
    fireEvent.click(screen.getByRole('button', { name: 'امروز' }));
    expect(monthHeading(container)).toHaveTextContent(faIR.months[2]!);
  });

  it('opens the month picker panel from the heading', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={today} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    fireEvent.click(monthHeading(container));
    expect(screen.getAllByRole('option')).toHaveLength(12);
  });
});
