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
});
