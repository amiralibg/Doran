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
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'یک تاریخ');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('formats a controlled value in the trigger', () => {
    render(<DoranDatePicker value={value} />);
    expect(screen.getByRole('textbox')).toHaveValue('۱۴۰۵/۰۳/۱۵');
  });

  it('opens the calendar dialog when the trigger is clicked', () => {
    render(<DoranDatePicker defaultValue={value} />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    expect(screen.getByRole('dialog', { name: 'تقویم' })).toBeInTheDocument();
  });

  it('picks a day, fires onChange, and closes the popover', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker defaultValue={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    fireEvent.click(cell(1405, 3, 22));
    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0]![0] as DoranDate;
    expect([picked.year, picked.month, picked.day]).toEqual([1405, 3, 22]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the popover on Escape', () => {
    render(<DoranDatePicker defaultValue={value} />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(<DoranDatePicker disabled placeholder="انتخاب تاریخ" />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('portals the popover to <body> so overflow ancestors cannot clip it', () => {
    const { container } = render(
      <div style={{ overflow: 'hidden' }}>
        <DoranDatePicker defaultValue={value} />
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    const dialog = screen.getByRole('dialog', { name: 'تقویم' });
    // Rendered outside the component tree, directly under <body>.
    expect(container.contains(dialog)).toBe(false);
    expect(dialog.parentElement).toBe(document.body);
  });

  it('keeps the popover open when clicking inside the portaled dialog', () => {
    render(<DoranDatePicker defaultValue={value} withTime />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
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

  it('clears to nullable values and closes even when withTime', () => {
    const onChange = vi.fn();
    render(
      <DoranDatePicker
        defaultValue={value}
        withTime
        footerActions={['clear']}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    fireEvent.click(screen.getByRole('button', { name: 'پاک کردن' }));
    expect(onChange).toHaveBeenCalledWith(null, null);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'انتخاب تاریخ');
  });

  it('keeps a controlled value after Clear while emitting null and closing', () => {
    const onChange = vi.fn();
    render(
      <DoranDatePicker value={value} withTime footerActions={['clear']} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    fireEvent.click(screen.getByRole('button', { name: 'پاک کردن' }));
    expect(onChange).toHaveBeenCalledWith(null, null);
    expect(screen.getByRole('textbox')).toHaveValue('۱۴۰۵/۰۳/۱۵ ۰۰:۰۰');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('treats Today like date selection for plain and time-enabled pickers', () => {
    const plainChange = vi.fn();
    const { unmount } = render(
      <DoranDatePicker footerActions={['today']} onChange={plainChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    fireEvent.click(screen.getByRole('button', { name: 'امروز' }));
    expect(plainChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    unmount();
    const timeChange = vi.fn();
    render(<DoranDatePicker withTime footerActions={['today']} onChange={timeChange} />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    fireEvent.click(screen.getByRole('button', { name: 'امروز' }));
    expect(timeChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('exposes trigger layout attributes and applies numeric input widths as pixels', () => {
    const { container } = render(
      <DoranDatePicker
        placeholder="یک تاریخ"
        iconPosition="right"
        textAlign="left"
        inputWidth={240}
      />,
    );
    const root = container.querySelector<HTMLElement>('.doran-datepicker')!;
    const trigger = container.querySelector<HTMLElement>('.doran-datepicker__input')!;
    const display = container.querySelector<HTMLElement>('.doran-datepicker__control')!;
    expect(root).toHaveAttribute('data-icon-position', 'right');
    expect(root).toHaveAttribute('data-text-align', 'left');
    expect(root.style.getPropertyValue('--doran-input-width')).toBe('240px');
    expect(trigger).toHaveStyle({ width: '240px', flexDirection: 'row-reverse' });
    expect(display).toHaveStyle({ textAlign: 'left' });
    // Bidi isolation: without dir="auto" the RTL root reorders digit-only
    // values like `1405-04-16 03:24` into time-before-date.
    expect(display).toHaveAttribute('dir', 'auto');
  });

  it('supports custom and trigger-matched dropdown widths', () => {
    const { unmount } = render(<DoranDatePicker defaultValue={value} dropdownWidth={320} />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-dropdown-width', 'custom');
    expect(screen.getByRole('dialog')).toHaveStyle({ width: '320px' });

    unmount();
    const { container } = render(<DoranDatePicker defaultValue={value} dropdownWidth="trigger" />);
    const trigger = container.querySelector<HTMLElement>('.doran-datepicker__input')!;
    const rectSpy = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      width: 236,
      height: 40,
      top: 10,
      right: 246,
      bottom: 50,
      left: 10,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    });
    // The field is measured, but the icon is what opens the calendar.
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-dropdown-width', 'trigger');
    expect(dialog).toHaveStyle({ width: '236px' });
    rectSpy.mockRestore();
  });
});
