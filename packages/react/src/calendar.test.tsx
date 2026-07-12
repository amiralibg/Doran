import { DoranDate, enUS, faIR } from '@doranjs/core';
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

  it('localizes footer actions in English', () => {
    render(
      <DoranCalendar
        locale={enUS}
        timeZone="UTC"
        today={today}
        footerActions={['today', 'clear']}
      />,
    );

    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'امروز' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'پاک کردن' })).not.toBeInTheDocument();
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

  it('selects today via the footer button after navigating away', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DoranCalendar
        timeZone="UTC"
        today={today}
        defaultMonth={{ year: 1405, month: 3 }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'ماه بعد' }));
    expect(monthHeading(container)).toHaveTextContent(faIR.months[3]!);
    fireEvent.click(screen.getByRole('button', { name: 'امروز' }));
    expect(monthHeading(container)).toHaveTextContent(faIR.months[2]!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ year: 1405, month: 3, day: 15 }),
    );
    expect(cell(container, 1405, 3, 15).closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('disables Today when it falls outside min/max bounds', () => {
    const onChange = vi.fn();
    const max = DoranDate.fromJalali(1405, 3, 14, UTC);
    render(<DoranCalendar timeZone="UTC" today={today} max={max} onChange={onChange} />);
    const todayButton = screen.getByRole('button', { name: 'امروز' });
    expect(todayButton).toBeDisabled();
    fireEvent.click(todayButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('combines Today with the selected or default time when withTime', () => {
    const selectedTimeChange = vi.fn();
    const selected = DoranDate.fromJalali(1405, 3, 10, UTC).addHours(9).addMinutes(45);
    const { unmount } = render(
      <DoranCalendar
        timeZone="UTC"
        today={today}
        defaultValue={selected}
        withTime
        onChange={selectedTimeChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'امروز' }));
    const picked = selectedTimeChange.mock.calls[0]![0] as DoranDate;
    expect([picked.year, picked.month, picked.day, picked.hour, picked.minute]).toEqual([
      1405, 3, 15, 9, 45,
    ]);

    unmount();
    const defaultTimeChange = vi.fn();
    render(
      <DoranCalendar
        timeZone="UTC"
        today={today}
        withTime
        defaultTime={{ hour: 13, minute: 20 }}
        onChange={defaultTimeChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'امروز' }));
    const defaultTimePick = defaultTimeChange.mock.calls[0]![0] as DoranDate;
    expect([defaultTimePick.hour, defaultTimePick.minute]).toEqual([13, 20]);
  });

  it('renders ordered footer actions, clears, and supports hiding the footer', () => {
    const onChange = vi.fn();
    const selected = DoranDate.fromJalali(1405, 3, 10, UTC);
    const { container, rerender } = render(
      <DoranCalendar
        timeZone="UTC"
        today={today}
        defaultValue={selected}
        footerActions={['clear', 'today']}
        onChange={onChange}
      />,
    );
    const actions = Array.from(container.querySelectorAll('[data-footer-action]'));
    expect(actions.map((action) => action.getAttribute('data-footer-action'))).toEqual([
      'clear',
      'today',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'پاک کردن' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(cell(container, 1405, 3, 10).closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'false',
    );

    rerender(<DoranCalendar timeZone="UTC" today={today} footerActions={[]} />);
    expect(container.querySelector('.doran-calendar__footer')).not.toBeInTheDocument();
  });

  it('opens the month picker panel from the heading', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={today} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    fireEvent.click(monthHeading(container));
    expect(screen.getAllByRole('option')).toHaveLength(12);
  });
});
