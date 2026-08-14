import { DoranDate } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DoranCalendar } from './calendar';
import { useDoranCalendar } from './calendar-context';
import { DoranRangePicker } from './range-picker';

const UTC = { timeZone: 'UTC' };
const today = DoranDate.fromJalali(1405, 3, 15, UTC);

function calendarProps() {
  return { timeZone: 'UTC', today, defaultMonth: { year: 1405, month: 3 } } as const;
}

describe('DoranCalendar slots', () => {
  it('renders legend, aside and footer content', () => {
    const { container } = render(
      <DoranCalendar
        {...calendarProps()}
        slots={{
          legend: <span data-testid="legend">راهنما</span>,
          aside: <span data-testid="aside">کنار</span>,
          footer: <span data-testid="footer">پانویس</span>,
        }}
      />,
    );

    expect(screen.getByTestId('legend')).toBeInTheDocument();
    expect(screen.getByTestId('aside')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(container.querySelector('.doran-calendar__aside')).toContainElement(
      screen.getByTestId('aside'),
    );
  });

  // The row wrapper is extra DOM, so it should only appear when there is something
  // to place beside the grid.
  it('only introduces the body wrapper when an aside is present', () => {
    const { container: plain } = render(<DoranCalendar {...calendarProps()} />);
    expect(plain.querySelector('.doran-calendar__body')).toBeNull();

    const { container: withAside } = render(
      <DoranCalendar {...calendarProps()} slots={{ aside: <span>x</span> }} />,
    );
    expect(withAside.querySelector('.doran-calendar__body')).not.toBeNull();
  });

  it('shows the footer for a slot even when every built-in action is hidden', () => {
    const { container } = render(
      <DoranCalendar
        {...calendarProps()}
        footerActions={[]}
        slots={{ footer: <span data-testid="footer">فقط اسلات</span> }}
      />,
    );

    expect(container.querySelector('.doran-calendar__footer')).not.toBeNull();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(container.querySelector('[data-footer-action]')).toBeNull();
  });
});

describe('useDoranCalendar', () => {
  function MonthReadout() {
    const { year, month, selected } = useDoranCalendar();
    return (
      <span data-testid="readout">
        {year}-{month}-{selected ? selected.day : 'none'}
      </span>
    );
  }

  it('exposes the displayed month and selection to slot content', () => {
    render(
      <DoranCalendar
        {...calendarProps()}
        defaultValue={DoranDate.fromJalali(1405, 3, 9, UTC)}
        slots={{ footer: <MonthReadout /> }}
      />,
    );

    expect(screen.getByTestId('readout')).toHaveTextContent('1405-3-9');
  });

  it('lets a slot widget drive navigation', () => {
    function JumpThreeMonths() {
      const { year, month, setMonth } = useDoranCalendar();
      return (
        <>
          <button type="button" onClick={() => setMonth({ year, month: month + 3 })}>
            jump
          </button>
          <MonthReadout />
        </>
      );
    }

    render(<DoranCalendar {...calendarProps()} slots={{ footer: <JumpThreeMonths /> }} />);
    expect(screen.getByTestId('readout')).toHaveTextContent('1405-3-none');

    fireEvent.click(screen.getByRole('button', { name: 'jump' }));
    expect(screen.getByTestId('readout')).toHaveTextContent('1405-6-none');

    // The grid itself must follow, not just the context value.
    expect(screen.getByRole('grid')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('شهریور') as unknown as string,
    );
  });

  it('lets a slot widget select a day through the calendar rules', () => {
    const onChange = vi.fn();

    function PickTheTenth() {
      const { select, year, month } = useDoranCalendar();
      return (
        <button type="button" onClick={() => select(DoranDate.fromJalali(year, month, 10, UTC))}>
          pick
        </button>
      );
    }

    render(
      <DoranCalendar
        {...calendarProps()}
        onChange={onChange}
        slots={{ footer: <PickTheTenth /> }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'pick' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0]![0] as DoranDate).day).toBe(10);
  });

  it('refuses to select a day the calendar has disabled', () => {
    const onChange = vi.fn();

    function PickTheTenth() {
      const { select, year, month } = useDoranCalendar();
      return (
        <button type="button" onClick={() => select(DoranDate.fromJalali(year, month, 10, UTC))}>
          pick
        </button>
      );
    }

    render(
      <DoranCalendar
        {...calendarProps()}
        disabledDates={(d) => d.day === 10}
        onChange={onChange}
        slots={{ footer: <PickTheTenth /> }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'pick' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('throws a directive error when used outside a calendar', () => {
    function Orphan() {
      useDoranCalendar();
      return null;
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(/must be called inside a Doran calendar/);
    spy.mockRestore();
  });
});

describe('DoranRangePicker slots', () => {
  it('shares the sidebar between aside content and presets', () => {
    const { container } = render(
      <DoranRangePicker presets slots={{ aside: <span data-testid="aside">فیلتر</span> }} />,
    );

    const sidebar = container.querySelector('.doran-rangepicker__presets')!;
    expect(sidebar).toContainElement(screen.getByTestId('aside'));
    // The presets keep their own labelled group so the aside doesn't join it.
    expect(sidebar.querySelector('.doran-rangepicker__preset-group')).not.toBeNull();
  });

  it('renders the sidebar for an aside even with no presets', () => {
    const { container } = render(
      <DoranRangePicker slots={{ aside: <span data-testid="aside">فیلتر</span> }} />,
    );

    expect(container.querySelector('.doran-rangepicker__presets')).not.toBeNull();
    expect(container.querySelector('.doran-rangepicker__preset-group')).toBeNull();
  });

  it('exposes the selected range to slot content', () => {
    function RangeReadout() {
      const { range } = useDoranCalendar();
      return <span data-testid="range">{range?.start ? range.start.day : 'empty'}</span>;
    }

    const { container } = render(
      <DoranRangePicker slots={{ footer: <RangeReadout /> }} footerActions={[]} />,
    );

    expect(screen.getByTestId('range')).toHaveTextContent('empty');
    fireEvent.click(container.querySelector<HTMLButtonElement>('.doran-day')!);
    expect(screen.getByTestId('range')).not.toHaveTextContent('empty');
  });
});
