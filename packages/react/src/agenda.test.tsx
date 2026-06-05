import { DoranDate } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DoranAgenda, type AgendaEvent } from './agenda';

const UTC = { timeZone: 'UTC' };
const start = DoranDate.fromJalali(1405, 3, 1, UTC);

const events: AgendaEvent[] = [
  { id: 'a', date: DoranDate.fromJalali(1405, 3, 1, UTC), title: 'جلسه تیم' },
  { id: 'b', date: DoranDate.fromJalali(1405, 3, 3, UTC), title: 'تولد' },
];

describe('DoranAgenda', () => {
  it('renders the requested number of day sections', () => {
    const { container } = render(<DoranAgenda start={start} days={5} />);
    expect(container.querySelectorAll('.doran-agenda__day')).toHaveLength(5);
  });

  it('places events on their day and shows an empty state otherwise', () => {
    render(<DoranAgenda start={start} days={3} events={events} />);
    expect(screen.getByText('جلسه تیم')).toBeInTheDocument();
    expect(screen.getByText('تولد')).toBeInTheDocument();
    // The middle day (3 Khordad has an event, 2 Khordad does not).
    expect(screen.getAllByText('رویدادی نیست')).toHaveLength(1);
  });

  it('calls onSelectDay when a day header is clicked', () => {
    const onSelectDay = vi.fn();
    const { container } = render(<DoranAgenda start={start} days={3} onSelectDay={onSelectDay} />);
    const firstDate = container.querySelector<HTMLButtonElement>('.doran-agenda__date')!;
    fireEvent.click(firstDate);
    expect(onSelectDay).toHaveBeenCalledTimes(1);
    const day = onSelectDay.mock.calls[0]![0] as DoranDate;
    expect([day.year, day.month, day.day]).toEqual([1405, 3, 1]);
  });

  it('uses a custom event renderer when provided', () => {
    render(
      <DoranAgenda
        start={start}
        days={1}
        events={events}
        renderEvent={(e) => <span data-testid="custom">{e.title}!</span>}
      />,
    );
    expect(screen.getByTestId('custom')).toHaveTextContent('جلسه تیم!');
  });
});
