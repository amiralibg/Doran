import { DoranDate, enUS } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DoranRangePicker } from './range-picker';

const UTC = { timeZone: 'UTC' };
const start = DoranDate.fromJalali(1405, 3, 5, UTC);
const end = DoranDate.fromJalali(1405, 3, 10, UTC);

describe('DoranRangePicker footer actions', () => {
  it('shows Clear by default and resets through the normal change flow', () => {
    const onChange = vi.fn();
    render(<DoranRangePicker timeZone="UTC" defaultValue={{ start, end }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'پاک کردن' }));
    expect(onChange).toHaveBeenCalledWith({ start: null, end: null }, { start: null, end: null });
  });

  it('localizes Clear in English', () => {
    render(<DoranRangePicker locale={enUS} timeZone="UTC" />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'پاک کردن' })).not.toBeInTheDocument();
  });

  it('hides the entire footer when footerActions is empty', () => {
    const { container } = render(<DoranRangePicker timeZone="UTC" footerActions={[]} />);
    expect(container.querySelector('.doran-rangepicker__footer')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'پاک کردن' })).not.toBeInTheDocument();
  });
});
