import { DoranDate } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DoranDatePicker } from './date-picker';

const UTC = { timeZone: 'UTC' };
const value = DoranDate.fromJalali(1405, 3, 15, UTC);

function cell(year: number, month: number, day: number) {
  return document.querySelector<HTMLButtonElement>(`[data-cell-date="${year}-${month}-${day}"]`)!;
}

describe('DoranDatePicker', () => {
  it('shows the placeholder until a value is chosen', () => {
    render(<DoranDatePicker placeholder="یک تاریخ" />);
    expect(screen.getByText('یک تاریخ')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('formats a controlled value in the trigger', () => {
    render(<DoranDatePicker value={value} />);
    expect(screen.getByText('۱۴۰۵/۰۳/۱۵')).toBeInTheDocument();
  });

  it('opens the calendar dialog when the trigger is clicked', () => {
    render(<DoranDatePicker defaultValue={value} />);
    fireEvent.click(screen.getByRole('button', { name: /۱۴۰۵/ }));
    expect(screen.getByRole('dialog', { name: 'تقویم' })).toBeInTheDocument();
  });

  it('picks a day, fires onChange, and closes the popover', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker defaultValue={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /۱۴۰۵/ }));
    fireEvent.click(cell(1405, 3, 22));
    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0]![0] as DoranDate;
    expect([picked.year, picked.month, picked.day]).toEqual([1405, 3, 22]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the popover on Escape', () => {
    render(<DoranDatePicker defaultValue={value} />);
    fireEvent.click(screen.getByRole('button', { name: /۱۴۰۵/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(<DoranDatePicker disabled placeholder="انتخاب تاریخ" />);
    fireEvent.click(screen.getByRole('button', { name: 'انتخاب تاریخ' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('portals the popover to <body> so overflow ancestors cannot clip it', () => {
    const { container } = render(
      <div style={{ overflow: 'hidden' }}>
        <DoranDatePicker defaultValue={value} />
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: /۱۴۰۵/ }));
    const dialog = screen.getByRole('dialog', { name: 'تقویم' });
    // Rendered outside the component tree, directly under <body>.
    expect(container.contains(dialog)).toBe(false);
    expect(dialog.parentElement).toBe(document.body);
  });

  it('keeps the popover open when clicking inside the portaled dialog', () => {
    render(<DoranDatePicker defaultValue={value} withTime />);
    fireEvent.click(screen.getByRole('button', { name: /۱۴۰۵/ }));
    const dialog = screen.getByRole('dialog', { name: 'تقویم' });
    fireEvent.pointerDown(dialog);
    expect(screen.getByRole('dialog', { name: 'تقویم' })).toBeInTheDocument();
    // …and an outside pointerdown still closes it.
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the default calendar icon', () => {
    render(<DoranDatePicker placeholder="یک تاریخ" />);
    expect(document.querySelector('.doran-datepicker__icon svg')).toBeInTheDocument();
  });

  it('hides the icon when icon={null}', () => {
    render(<DoranDatePicker placeholder="یک تاریخ" icon={null} />);
    expect(document.querySelector('.doran-datepicker__icon')).not.toBeInTheDocument();
  });

  it('renders a custom icon', () => {
    render(<DoranDatePicker placeholder="یک تاریخ" icon={<span data-testid="my-icon">★</span>} />);
    expect(screen.getByTestId('my-icon')).toBeInTheDocument();
    expect(document.querySelector('.doran-datepicker__icon svg')).not.toBeInTheDocument();
  });
});
