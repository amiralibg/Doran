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

  it('marks days rejected by isDisabled with aria-disabled', () => {
    const { container } = render(<DoranMonthView grid={grid} isDisabled={(d) => d.day === 5} />);
    expect(cell(container, 1405, 3, 5)).toHaveAttribute('aria-disabled', 'true');
    expect(cell(container, 1405, 3, 6)).not.toHaveAttribute('aria-disabled');
  });

  // `aria-disabled` rather than `disabled` is deliberate: the native attribute pulls
  // the day out of the tab order, so a keyboard user can never reach it to hear why
  // it is unavailable.
  it('keeps disabled days reachable but unselectable', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <DoranMonthView
        grid={grid}
        isDisabled={(d) => d.day === 2}
        isOutOfBounds={() => false}
        onSelect={onSelect}
      />,
    );
    const gridEl = screen.getByRole('grid');
    const disabled = cell(container, 1405, 3, 2);

    expect(disabled).not.toBeDisabled();

    // Arrowing onto a blocked day must land on it, not jump past it.
    fireEvent.focus(gridEl);
    fireEvent.keyDown(gridEl, { key: 'ArrowLeft' });
    expect(disabled).toHaveFocus();

    fireEvent.click(disabled);
    fireEvent.keyDown(gridEl, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('skips past out-of-bounds days, which can span decades', () => {
    const { container } = render(
      <DoranMonthView
        grid={grid}
        isDisabled={(d) => d.day >= 2 && d.day <= 4}
        isOutOfBounds={(d) => d.day >= 2 && d.day <= 4}
      />,
    );
    const gridEl = screen.getByRole('grid');

    fireEvent.focus(gridEl);
    fireEvent.keyDown(gridEl, { key: 'ArrowLeft' });

    expect(cell(container, 1405, 3, 5)).toHaveAttribute('tabindex', '0');
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

describe('DoranMonthView day annotations', () => {
  it('renders dayContent beneath the day number', () => {
    const { container } = render(
      <DoranMonthView
        grid={grid}
        dayContent={(day) => (day.day === 12 ? <span data-testid="fare">۱٬۲۰۰٬۰۰۰</span> : null)}
      />,
    );

    const btn = cell(container, 1405, 3, 12);
    expect(within(btn).getByTestId('fare')).toBeInTheDocument();
    // The number stays its own node so the two lines can be styled separately.
    expect(btn.querySelector('.doran-day__number')).toHaveTextContent('۱۲');
    expect(cell(container, 1405, 3, 13).querySelector('.doran-day__content')).toBeNull();
  });

  it('switches the grid to the rich layout only when content can appear', () => {
    const { container: plain } = render(<DoranMonthView grid={grid} />);
    expect(plain.querySelector('.doran-month')).not.toHaveClass('doran-month--rich');

    const { container: rich } = render(<DoranMonthView grid={grid} dayContent={() => null} />);
    expect(rich.querySelector('.doran-month')).toHaveClass('doran-month--rich');
  });

  it('renders dayData text and tone without a render function', () => {
    const { container } = render(
      <DoranMonthView grid={grid} dayData={{ '1405/03/12': { text: '۱٬۲۰۰', tone: 'low' } }} />,
    );

    const content = cell(container, 1405, 3, 12).querySelector('.doran-day__content')!;
    expect(content).toHaveTextContent('۱٬۲۰۰');
    expect(content).toHaveAttribute('data-tone', 'low');
  });

  it('lets dayContent win over dayData for the same day', () => {
    const { container } = render(
      <DoranMonthView
        grid={grid}
        dayData={{ '1405-3-12': { text: 'from data' } }}
        dayContent={(day) => (day.day === 12 ? 'from content' : null)}
      />,
    );

    expect(cell(container, 1405, 3, 12).querySelector('.doran-day__content')).toHaveTextContent(
      'from content',
    );
  });

  it('merges className, style and data-* from dayProps', () => {
    const { container } = render(
      <DoranMonthView
        grid={grid}
        dayProps={(day) =>
          day.day === 12
            ? { className: 'is-cheapest', style: { fontWeight: 700 }, 'data-fare': '1200000' }
            : undefined
        }
      />,
    );

    const btn = cell(container, 1405, 3, 12);
    expect(btn).toHaveClass('doran-day', 'is-cheapest');
    expect(btn).toHaveAttribute('data-fare', '1200000');
    expect(btn.style.fontWeight).toBe('700');
  });

  // Without this the widget is purely visual — the day's aria-label would replace
  // the custom content rather than include it.
  it('appends custom labels to the accessible name instead of replacing it', () => {
    const { container } = render(
      <DoranMonthView
        grid={grid}
        dayProps={(day) => (day.day === 12 ? { label: 'ارزان‌ترین نرخ' } : undefined)}
      />,
    );

    const label = cell(container, 1405, 3, 12).getAttribute('aria-label')!;
    expect(label).toContain('۱۲ خرداد ۱۴۰۵');
    expect(label).toContain('ارزان‌ترین نرخ');
  });

  it('falls back to dayData text for the accessible name', () => {
    const { container } = render(
      <DoranMonthView grid={grid} dayData={{ '1405-3-12': { text: '۳ رویداد' } }} />,
    );
    expect(cell(container, 1405, 3, 12).getAttribute('aria-label')).toContain('۳ رویداد');
  });

  it('disables a day from dayData and announces the reason', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <DoranMonthView
        grid={grid}
        onSelect={onSelect}
        dayData={{ '1405-3-12': { disabled: true, disabledReason: 'ظرفیت تکمیل' } }}
      />,
    );

    const btn = cell(container, 1405, 3, 12);
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn).toHaveAttribute('title', 'ظرفیت تکمیل');
    expect(btn.getAttribute('aria-label')).toContain('ظرفیت تکمیل');

    fireEvent.click(btn);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('lets dayProps override the disabled state decided by min/max', () => {
    const { container } = render(
      <DoranMonthView
        grid={grid}
        isDisabled={() => true}
        dayProps={(day) => (day.day === 12 ? { disabled: false } : undefined)}
      />,
    );

    expect(cell(container, 1405, 3, 12)).not.toHaveAttribute('aria-disabled');
    expect(cell(container, 1405, 3, 13)).toHaveAttribute('aria-disabled', 'true');
  });

  it('passes cell state to dayProps so widgets can react to it', () => {
    const seen: Record<string, unknown> = {};
    render(
      <DoranMonthView
        grid={grid}
        isSelected={(d) => d.day === 12}
        isDisabled={(d) => d.day === 12}
        dayProps={(day, meta) => {
          if (day.day === 12) Object.assign(seen, meta);
          return undefined;
        }}
      />,
    );

    expect(seen).toMatchObject({
      year: 1405,
      month: 3,
      day: 12,
      inCurrentMonth: true,
      selected: true,
      disabled: true,
    });
  });

  it('lands on days blocked by dayData so the reason can be announced', () => {
    const { container } = render(
      <DoranMonthView
        grid={grid}
        isOutOfBounds={() => false}
        dayData={{ '1405-3-2': { disabled: true, disabledReason: 'ظرفیت تکمیل' } }}
      />,
    );
    const gridEl = screen.getByRole('grid');

    fireEvent.focus(gridEl);
    fireEvent.keyDown(gridEl, { key: 'ArrowLeft' });

    const blocked = cell(container, 1405, 3, 2);
    expect(blocked).toHaveAttribute('tabindex', '0');
    expect(blocked.getAttribute('aria-label')).toContain('ظرفیت تکمیل');
  });
});
