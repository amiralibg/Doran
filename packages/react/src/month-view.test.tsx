import { DoranDate } from '@doranjs/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildMonthGrid } from './grid';
import { DoranMonthView } from './month-view';

const UTC = { timeZone: 'UTC' };
// Pin "today" outside the displayed month so the initial roving tabstop is the 1st,
// independent of the machine's real date.
const grid = buildMonthGrid(1405, 3, { ...UTC, today: DoranDate.fromJalali(1400, 1, 1, UTC) });

function cell(container: HTMLElement, year: number, month: number, day: number) {
  return container.querySelector<HTMLButtonElement>(`[data-cell-date="${year}-${month}-${day}"]`)!;
}

describe('DoranMonthView', () => {
  it('renders an accessible grid with seven weekday headers', () => {
    render(<DoranMonthView grid={grid} />);
    const gridEl = screen.getByRole('grid');
    expect(gridEl).toHaveAttribute('dir', 'rtl');
    expect(within(gridEl).getAllByRole('columnheader')).toHaveLength(7);
  });

  it('renders all 31 days of Khordad as day buttons', () => {
    const { container } = render(<DoranMonthView grid={grid} showOutsideDays={false} />);
    for (let d = 1; d <= 31; d += 1) {
      expect(cell(container, 1405, 3, d)).toBeInTheDocument();
    }
  });

  it('calls onSelect with the clicked day', () => {
    const onSelect = vi.fn();
    const { container } = render(<DoranMonthView grid={grid} onSelect={onSelect} />);
    fireEvent.click(cell(container, 1405, 3, 15));
    expect(onSelect).toHaveBeenCalledTimes(1);
    const picked = onSelect.mock.calls[0]![0] as DoranDate;
    expect([picked.year, picked.month, picked.day]).toEqual([1405, 3, 15]);
  });

  it('marks the selected day with aria-selected and a modifier class', () => {
    const selected = DoranDate.fromJalali(1405, 3, 10, UTC);
    const { container } = render(
      <DoranMonthView grid={grid} isSelected={(d) => d.isSame(selected, 'day')} />,
    );
    const btn = cell(container, 1405, 3, 10);
    expect(btn).toHaveClass('doran-day--selected');
    expect(btn.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
  });

  it('disables days rejected by isDisabled', () => {
    const { container } = render(<DoranMonthView grid={grid} isDisabled={(d) => d.day === 5} />);
    expect(cell(container, 1405, 3, 5)).toBeDisabled();
    expect(cell(container, 1405, 3, 6)).not.toBeDisabled();
  });

  it('hides outside days when showOutsideDays is false', () => {
    const { container } = render(<DoranMonthView grid={grid} showOutsideDays={false} />);
    const outside = container.querySelectorAll('.doran-day--outside');
    expect(outside).toHaveLength(0);
    expect(container.querySelectorAll('.doran-month__spacer').length).toBeGreaterThan(0);
  });

  it('moves the roving tabstop with the arrow keys (RTL: ArrowLeft advances a day)', () => {
    const { container } = render(<DoranMonthView grid={grid} />);
    const gridEl = screen.getByRole('grid');
    // With nothing selected, the 1st of the month is the initial tabstop.
    expect(cell(container, 1405, 3, 1)).toHaveAttribute('tabindex', '0');
    fireEvent.focus(gridEl);
    fireEvent.keyDown(gridEl, { key: 'ArrowLeft' });
    expect(cell(container, 1405, 3, 2)).toHaveAttribute('tabindex', '0');
    expect(cell(container, 1405, 3, 1)).toHaveAttribute('tabindex', '-1');
    expect(cell(container, 1405, 3, 2)).toHaveFocus();
  });
});
