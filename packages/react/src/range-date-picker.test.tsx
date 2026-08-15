import { DoranDate, enUS } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DoranRangeDatePicker } from './range-date-picker';
import type { DateRange } from './hooks';

const UTC = { timeZone: 'UTC' };

const startField = () => screen.getByRole('textbox', { name: 'از تاریخ' }) as HTMLInputElement;
const endField = () => screen.getByRole('textbox', { name: 'تا تاریخ' }) as HTMLInputElement;

function type(field: HTMLInputElement, text: string) {
  fireEvent.change(field, { target: { value: text } });
}

describe('DoranRangeDatePicker', () => {
  it('renders one trigger holding two fields', () => {
    const { container } = render(<DoranRangeDatePicker />);
    expect(container.querySelectorAll('.doran-rangetrigger__control')).toHaveLength(2);
    expect(container.querySelectorAll('.doran-datepicker__input')).toHaveLength(1);
  });

  it('shows a controlled range in both fields', () => {
    render(
      <DoranRangeDatePicker
        value={{
          start: DoranDate.fromJalali(1405, 3, 10, UTC),
          end: DoranDate.fromJalali(1405, 3, 20, UTC),
        }}
      />,
    );
    expect(startField()).toHaveValue('۱۴۰۵/۰۳/۱۰');
    expect(endField()).toHaveValue('۱۴۰۵/۰۳/۲۰');
  });

  it('accepts the same loose value forms as the single picker', () => {
    render(<DoranRangeDatePicker value={{ start: '1405/03/10', end: '2026-06-10' }} />);
    expect(startField()).toHaveValue('۱۴۰۵/۰۳/۱۰');
    expect(endField()).toHaveValue('۱۴۰۵/۰۳/۲۰');
  });

  it('parses a typed date into the field being edited', () => {
    const onChange = vi.fn();
    render(<DoranRangeDatePicker onChange={onChange} />);

    type(startField(), '1405/03/10');

    const [range] = onChange.mock.calls[0] as [DateRange];
    expect(range.start?.day).toBe(10);
    expect(range.end).toBeNull();
  });

  // Nothing previously enforced ordering, so a backwards range was simply accepted.
  it('swaps a range typed backwards', () => {
    const onChange = vi.fn();
    render(<DoranRangeDatePicker onChange={onChange} />);

    type(startField(), '1405/03/20');
    type(endField(), '1405/03/10');

    const [range] = onChange.mock.calls.at(-1) as [DateRange];
    expect(range.start?.day).toBe(10);
    expect(range.end?.day).toBe(20);
  });

  it('swaps a range picked backwards in the grid', () => {
    const onChange = vi.fn();
    render(<DoranRangeDatePicker onChange={onChange} />);

    fireEvent.focus(startField());
    // Re-query between clicks: React replaces the grid nodes on the first pick, so a
    // NodeList captured up front would have the second click land on a detached node.
    const day = (index: number) =>
      screen.getByRole('dialog').querySelectorAll<HTMLButtonElement>('.doran-day')[index]!;

    // Later day first, then an earlier one.
    fireEvent.click(day(20));
    fireEvent.click(day(5));

    const [range] = onChange.mock.calls.at(-1) as [DateRange];
    expect(range.start).not.toBeNull();
    expect(range.end).not.toBeNull();
    expect(range.end!.isBefore(range.start!)).toBe(false);
  });

  it('opens on focus and advances from start to end', () => {
    render(<DoranRangeDatePicker />);

    fireEvent.focus(startField());
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.click(dialog.querySelector<HTMLButtonElement>('.doran-day')!);
    // One end chosen: the pop-over stays open for the other.
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('opens on ArrowDown and closes on Escape', () => {
    render(<DoranRangeDatePicker readOnly />);

    fireEvent.keyDown(startField(), { key: 'ArrowDown' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('refuses a typed date outside min/max', () => {
    const onChange = vi.fn();
    render(<DoranRangeDatePicker onChange={onChange} min="1405/03/10" max="1405/03/20" />);

    type(startField(), '1405/03/25');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('submits each end as a machine-readable hidden field', () => {
    render(
      <form>
        <DoranRangeDatePicker
          startName="from"
          endName="to"
          defaultValue={{ start: '1405/03/10', end: '1405/03/20' }}
        />
        <button type="submit">go</button>
      </form>,
    );

    const form = screen.getByRole('button', { name: 'go' }).closest('form')!;
    const data = new FormData(form);
    expect(data.get('from')).toBe('1405-03-10');
    expect(data.get('to')).toBe('1405-03-20');
  });

  it('follows the locale for direction and field names', () => {
    const { container } = render(<DoranRangeDatePicker locale={enUS} />);

    expect(container.querySelector('.doran-datepicker')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('textbox', { name: 'Start date' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'End date' })).toBeInTheDocument();
  });

  it('disables both fields and the calendar button', () => {
    render(<DoranRangeDatePicker disabled />);
    expect(startField()).toBeDisabled();
    expect(endField()).toBeDisabled();
    expect(screen.getByRole('button', { name: /تقویم/ })).toBeDisabled();
  });
});
