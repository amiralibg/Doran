import { DoranDate } from '@doranjs/core';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCalendar, useDateRange } from './hooks';

const UTC = { timeZone: 'UTC' };
const today = DoranDate.fromJalali(1405, 3, 15, UTC);

describe('useCalendar', () => {
  it('opens on the month of today by default', () => {
    const { result } = renderHook(() => useCalendar({ today }));
    expect(result.current.year).toBe(1405);
    expect(result.current.month).toBe(3);
  });

  it('navigates months and years, rolling over correctly', () => {
    const { result } = renderHook(() =>
      useCalendar({ today, defaultMonth: { year: 1405, month: 12 } }),
    );
    act(() => result.current.goToNextMonth());
    expect([result.current.year, result.current.month]).toEqual([1406, 1]);
    act(() => result.current.goToPrevMonth());
    expect([result.current.year, result.current.month]).toEqual([1405, 12]);
    act(() => result.current.goToNextYear());
    expect([result.current.year, result.current.month]).toEqual([1406, 12]);
  });

  it('selects a day and exposes it through isSelected (uncontrolled)', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useCalendar({ today, onChange }));
    const day = DoranDate.fromJalali(1405, 4, 2, UTC);
    act(() => result.current.select(day));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(result.current.isSelected(day)).toBe(true);
    // Selecting also moves the view to the selected month.
    expect([result.current.year, result.current.month]).toEqual([1405, 4]);
  });

  it('honours min/max bounds via isDisabled and blocks disabled selection', () => {
    const onChange = vi.fn();
    const min = DoranDate.fromJalali(1405, 3, 10, UTC);
    const max = DoranDate.fromJalali(1405, 3, 20, UTC);
    const { result } = renderHook(() => useCalendar({ today, min, max, onChange }));
    expect(result.current.isDisabled(DoranDate.fromJalali(1405, 3, 9, UTC))).toBe(true);
    expect(result.current.isDisabled(DoranDate.fromJalali(1405, 3, 21, UTC))).toBe(true);
    expect(result.current.isDisabled(DoranDate.fromJalali(1405, 3, 15, UTC))).toBe(false);
    act(() => result.current.select(DoranDate.fromJalali(1405, 3, 9, UTC)));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('jumps back to today', () => {
    const { result } = renderHook(() => useCalendar({ today }));
    act(() => result.current.goToNextMonth());
    act(() => result.current.goToToday());
    expect([result.current.year, result.current.month]).toEqual([1405, 3]);
  });
});

describe('useDateRange', () => {
  const d = (day: number) => DoranDate.fromJalali(1405, 3, day, UTC);

  it('builds a range with the two-click start/end handshake', () => {
    const { result } = renderHook(() => useDateRange());
    act(() => result.current.selectDay(d(5)));
    expect(result.current.isStart(d(5))).toBe(true);
    expect(result.current.range.end).toBeNull();
    act(() => result.current.selectDay(d(10)));
    expect(result.current.isStart(d(5))).toBe(true);
    expect(result.current.isEnd(d(10))).toBe(true);
    expect(result.current.isInRange(d(7))).toBe(true);
    expect(result.current.isInRange(d(12))).toBe(false);
  });

  it('normalizes a reverse-ordered selection', () => {
    const { result } = renderHook(() => useDateRange());
    act(() => result.current.selectDay(d(20)));
    act(() => result.current.selectDay(d(8)));
    expect(result.current.isStart(d(8))).toBe(true);
    expect(result.current.isEnd(d(20))).toBe(true);
  });

  it('starts a fresh range on the third click', () => {
    const { result } = renderHook(() => useDateRange());
    act(() => result.current.selectDay(d(5)));
    act(() => result.current.selectDay(d(10)));
    act(() => result.current.selectDay(d(25)));
    expect(result.current.isStart(d(25))).toBe(true);
    expect(result.current.range.end).toBeNull();
  });

  it('sets and resets a range directly', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDateRange({ onChange }));
    act(() => result.current.setRange({ start: d(15), end: d(3) }));
    expect(result.current.isStart(d(3))).toBe(true);
    expect(result.current.isEnd(d(15))).toBe(true);
    act(() => result.current.reset());
    expect(result.current.range).toEqual({ start: null, end: null });
  });
});
