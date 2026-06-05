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
