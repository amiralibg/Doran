import { DoranDate, workingDaysBetween as weekendOnlyBetween } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { isHoliday } from './holidays';
import { addWorkingDays, isWorkingDay, nextWorkingDay, workingDaysBetween } from './working-days';

const UTC = { timeZone: 'UTC' };
const at = (y: number, m: number, d: number) => DoranDate.fromJalali(y, m, d, UTC);

describe('holiday-aware working days', () => {
  it('treats Fridays as non-working', () => {
    expect(isWorkingDay(at(1404, 3, 16))).toBe(false); // Friday
    expect(isWorkingDay(at(1404, 3, 22))).toBe(true); // Thursday, no holiday
  });

  it('adds working days, skipping weekends and holidays', () => {
    // 23 Khordad is a Friday and 24 is an official holiday, so +1 from Thursday the
    // 22nd lands on Sunday the 25th.
    expect(addWorkingDays(at(1404, 3, 22), 1).isSame(at(1404, 3, 25), 'day')).toBe(true);
  });

  it('treats an official holiday on a weekday as non-working', () => {
    // 2 Farvardin 1404 is a Saturday (a normal working weekday) but a Nowruz holiday.
    const nowruz = at(1404, 1, 2);
    expect(nowruz.dayOfWeek).toBe(0); // Saturday — not a weekend
    expect(isHoliday(nowruz)).toBe(true);
    expect(isWorkingDay(nowruz)).toBe(false);
  });

  it('always lands on a real working day', () => {
    let cursor = at(1403, 12, 25);
    for (let i = 0; i < 12; i += 1) {
      cursor = nextWorkingDay(cursor);
      expect(cursor.dayOfWeek).not.toBe(6); // not Friday
      expect(isHoliday(cursor)).toBe(false);
    }
  });

  it('skips the Nowruz holidays when counting a range', () => {
    // [1, 15) Farvardin: Fridays on days 1 and 8 → weekend-only count is 12.
    expect(weekendOnlyBetween(at(1404, 1, 1), at(1404, 1, 15))).toBe(12);
    // Plus non-Friday official holidays (days 2, 3, 4, 11, 12, 13) removed → 6.
    expect(workingDaysBetween(at(1404, 1, 1), at(1404, 1, 15))).toBe(6);
  });

  it('lets callers override the weekend set', () => {
    // 22 Khordad (Thursday) is a working day by default, but not with a Thu+Fri weekend.
    expect(isWorkingDay(at(1404, 3, 22))).toBe(true);
    expect(isWorkingDay(at(1404, 3, 22), { weekends: [5, 6] })).toBe(false);
  });
});
