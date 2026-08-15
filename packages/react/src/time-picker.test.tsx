import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DoranTimePicker, type TimeValue } from './time-picker';

describe('DoranTimePicker', () => {
  it('displays the hour and minute with Persian digits', () => {
    render(<DoranTimePicker value={{ hour: 9, minute: 5 }} onChange={() => {}} />);
    expect(screen.getByText('۰۹')).toBeInTheDocument();
    expect(screen.getByText('۰۵')).toBeInTheDocument();
  });

  it('increments and decrements the hour', () => {
    const onChange = vi.fn<(v: TimeValue) => void>();
    render(<DoranTimePicker value={{ hour: 9, minute: 30 }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'افزایش ساعت' }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 10, minute: 30 });
    fireEvent.click(screen.getByRole('button', { name: 'کاهش ساعت' }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 8, minute: 30 });
  });

  it('wraps the hour around the 24-hour boundary', () => {
    const onChange = vi.fn<(v: TimeValue) => void>();
    const { rerender } = render(
      <DoranTimePicker value={{ hour: 23, minute: 0 }} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'افزایش ساعت' }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 0, minute: 0 });

    rerender(<DoranTimePicker value={{ hour: 0, minute: 0 }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'کاهش ساعت' }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 23, minute: 0 });
  });

  it('steps minutes by minuteStep and wraps at 60', () => {
    const onChange = vi.fn<(v: TimeValue) => void>();
    render(<DoranTimePicker value={{ hour: 1, minute: 45 }} minuteStep={15} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'افزایش دقیقه' }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 1, minute: 0 });
  });
});

describe('keyboard', () => {
  // There was no keydown handler at all: the only way to change the time was to Tab
  // onto a chevron and press Enter, making 00:00 -> 23:45 a very long afternoon.
  function spin(name: string) {
    return screen.getByRole('spinbutton', { name });
  }

  it('exposes each field as a focusable spinbutton', () => {
    render(<DoranTimePicker value={{ hour: 9, minute: 30 }} onChange={() => {}} />);

    const hour = spin('ساعت');
    expect(hour).toHaveAttribute('tabindex', '0');
    expect(hour).toHaveAttribute('aria-valuenow', '9');
    expect(hour).toHaveAttribute('aria-valuemin', '0');
    expect(hour).toHaveAttribute('aria-valuemax', '23');
    expect(hour).toHaveAttribute('aria-valuetext', '۰۹');
  });

  it('adjusts the hour with the arrow keys', () => {
    const onChange = vi.fn();
    render(<DoranTimePicker value={{ hour: 9, minute: 30 }} onChange={onChange} />);

    fireEvent.keyDown(spin('ساعت'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith({ hour: 10, minute: 30 });

    fireEvent.keyDown(spin('ساعت'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith({ hour: 8, minute: 30 });
  });

  it('adjusts the minute by its step', () => {
    const onChange = vi.fn();
    render(<DoranTimePicker value={{ hour: 9, minute: 30 }} minuteStep={15} onChange={onChange} />);

    fireEvent.keyDown(spin('دقیقه'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith({ hour: 9, minute: 45 });
  });

  it('moves in larger jumps with PageUp and PageDown', () => {
    const onChange = vi.fn();
    render(<DoranTimePicker value={{ hour: 9, minute: 30 }} onChange={onChange} />);

    fireEvent.keyDown(spin('ساعت'), { key: 'PageUp' });
    expect(onChange).toHaveBeenCalledWith({ hour: 14, minute: 30 });
  });

  it('jumps to the bounds with Home and End', () => {
    const onChange = vi.fn();
    render(<DoranTimePicker value={{ hour: 9, minute: 30 }} onChange={onChange} />);

    fireEvent.keyDown(spin('ساعت'), { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith({ hour: 0, minute: 30 });

    fireEvent.keyDown(spin('دقیقه'), { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith({ hour: 9, minute: 59 });
  });

  it('wraps around the ends', () => {
    const onChange = vi.fn();
    render(<DoranTimePicker value={{ hour: 23, minute: 0 }} onChange={onChange} />);

    fireEvent.keyDown(spin('ساعت'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith({ hour: 0, minute: 0 });
  });

  it('leaves other keys to the browser', () => {
    const onChange = vi.fn();
    render(<DoranTimePicker value={{ hour: 9, minute: 30 }} onChange={onChange} />);

    fireEvent.keyDown(spin('ساعت'), { key: 'Tab' });
    expect(onChange).not.toHaveBeenCalled();
  });

  // Three fields x two chevrons would put six extra tab stops between the grid and
  // the footer; the spinbutton is the keyboard route.
  it('keeps the chevrons out of the tab order', () => {
    render(<DoranTimePicker value={{ hour: 9, minute: 30 }} onChange={() => {}} />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('tabindex', '-1');
    }
  });
});

describe('seconds and 12-hour mode', () => {
  it('adds a seconds field when asked', () => {
    const onChange = vi.fn();
    render(
      <DoranTimePicker
        value={{ hour: 9, minute: 30, second: 15 }}
        withSeconds
        onChange={onChange}
      />,
    );

    const seconds = screen.getByRole('spinbutton', { name: 'ثانیه' });
    expect(seconds).toHaveAttribute('aria-valuenow', '15');

    fireEvent.keyDown(seconds, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith({ hour: 9, minute: 30, second: 16 });
  });

  it('omits seconds from the emitted value by default', () => {
    const onChange = vi.fn();
    render(<DoranTimePicker value={{ hour: 9, minute: 30 }} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'ساعت' }), { key: 'ArrowUp' });
    expect(onChange.mock.calls[0]![0]).not.toHaveProperty('second');
  });

  it('shows a meridiem toggle in 12-hour mode', () => {
    const onChange = vi.fn();
    render(<DoranTimePicker value={{ hour: 15, minute: 0 }} hourCycle={12} onChange={onChange} />);

    // 15:00 displays as 03 PM, while the underlying value stays 24-hour.
    expect(screen.getByRole('spinbutton', { name: 'ساعت' })).toHaveAttribute(
      'aria-valuetext',
      '۰۳',
    );
    expect(screen.getByRole('spinbutton', { name: 'ساعت' })).toHaveAttribute('aria-valuenow', '15');

    const toggle = screen.getByRole('button', { pressed: true });
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith({ hour: 3, minute: 0 });
  });

  it('displays midnight and noon as 12', () => {
    const { rerender } = render(
      <DoranTimePicker value={{ hour: 0, minute: 0 }} hourCycle={12} onChange={() => {}} />,
    );
    expect(screen.getByRole('spinbutton', { name: 'ساعت' })).toHaveAttribute(
      'aria-valuetext',
      '۱۲',
    );

    rerender(
      <DoranTimePicker value={{ hour: 12, minute: 0 }} hourCycle={12} onChange={() => {}} />,
    );
    expect(screen.getByRole('spinbutton', { name: 'ساعت' })).toHaveAttribute(
      'aria-valuetext',
      '۱۲',
    );
  });
});
