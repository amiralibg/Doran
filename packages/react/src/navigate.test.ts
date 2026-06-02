import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { navigateFocus } from './grid';

const UTC = { timeZone: 'UTC' };
const at = (year: number, month: number, day: number) =>
  DoranDate.fromJalali({ year, month, day }, UTC);

describe('navigateFocus', () => {
  it('moves one day forward and back', () => {
    const d = at(1404, 3, 15);
    expect(navigateFocus(d, 'next-day').isSame(at(1404, 3, 16), 'day')).toBe(true);
    expect(navigateFocus(d, 'prev-day').isSame(at(1404, 3, 14), 'day')).toBe(true);
  });

  it('moves a full week up and down', () => {
    const d = at(1404, 3, 15);
    expect(navigateFocus(d, 'next-week').isSame(at(1404, 3, 22), 'day')).toBe(true);
    expect(navigateFocus(d, 'prev-week').isSame(at(1404, 3, 8), 'day')).toBe(true);
  });

  it('snaps to the Saturday/Friday edges of the week', () => {
    const d = at(1404, 3, 15);
    expect(navigateFocus(d, 'week-start').dayOfWeek).toBe(0); // Saturday
    expect(navigateFocus(d, 'week-end').dayOfWeek).toBe(6); // Friday
  });

  it('crosses the month boundary going backward from the 1st', () => {
    const target = navigateFocus(at(1405, 1, 1), 'prev-day');
    expect(target.year).toBe(1404);
    expect(target.month).toBe(12);
  });

  it('clamps the day when a month jump lands in a shorter month', () => {
    // Shahrivar (31 days) → Mehr (30 days): day 31 clamps to 30.
    const target = navigateFocus(at(1404, 6, 31), 'next-month');
    expect(target.isSame(at(1404, 7, 30), 'day')).toBe(true);
  });

  it('clamps Esfand 30 to 29 when a year jump leaves a leap year', () => {
    // 1403 is leap (Esfand 30); 1404 is not (Esfand 29).
    const target = navigateFocus(at(1403, 12, 30), 'next-year');
    expect(target.isSame(at(1404, 12, 29), 'day')).toBe(true);
  });

  it('moves whole years backward', () => {
    expect(navigateFocus(at(1404, 5, 10), 'prev-year').isSame(at(1403, 5, 10), 'day')).toBe(true);
  });
});
