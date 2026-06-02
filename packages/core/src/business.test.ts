import { describe, expect, it } from 'vitest';
import {
  addWorkingDays,
  isWeekend,
  isWorkingDay,
  nextWorkingDay,
  previousWorkingDay,
  workingDaysBetween,
} from './business';
import { DoranDate } from './doran-date';

const UTC = { timeZone: 'UTC' };
const at = (y: number, m: number, d: number) => DoranDate.fromJalali(y, m, d, UTC);
// Reference week in Khordad 1404: 10=Sat … 15=Thu, 16=Fri (weekend), 17=Sat …

describe('isWeekend / isWorkingDay (default Friday weekend)', () => {
  it('treats only Friday as the weekend by default', () => {
    expect(isWeekend(at(1404, 3, 16))).toBe(true); // Friday
    expect(isWeekend(at(1404, 3, 15))).toBe(false); // Thursday
    expect(isWeekend(at(1404, 3, 10))).toBe(false); // Saturday
  });

  it('marks Fridays as non-working days', () => {
    expect(isWorkingDay(at(1404, 3, 16))).toBe(false);
    expect(isWorkingDay(at(1404, 3, 15))).toBe(true);
  });

  it('honors a custom weekend set', () => {
    const weekends = [5, 6]; // Thursday + Friday
    expect(isWorkingDay(at(1404, 3, 15), { weekends })).toBe(false);
    expect(isWorkingDay(at(1404, 3, 14), { weekends })).toBe(true);
  });

  it('honors a holiday predicate', () => {
    const holidays = (d: DoranDate) => d.isSame(at(1404, 3, 17), 'day');
    expect(isWorkingDay(at(1404, 3, 17), { holidays })).toBe(false);
    expect(isWorkingDay(at(1404, 3, 18), { holidays })).toBe(true);
  });
});

describe('addWorkingDays', () => {
  it('skips the weekend moving forward', () => {
    // Thursday + 1 working day → Saturday (Friday skipped).
    expect(addWorkingDays(at(1404, 3, 15), 1).isSame(at(1404, 3, 17), 'day')).toBe(true);
    // Thursday + 2 → Sunday.
    expect(addWorkingDays(at(1404, 3, 15), 2).isSame(at(1404, 3, 18), 'day')).toBe(true);
  });

  it('moves backwards with a negative count', () => {
    // Saturday - 1 working day → Thursday (Friday skipped).
    expect(addWorkingDays(at(1404, 3, 17), -1).isSame(at(1404, 3, 15), 'day')).toBe(true);
  });

  it('returns the same date for a count of zero', () => {
    expect(addWorkingDays(at(1404, 3, 16), 0).isSame(at(1404, 3, 16), 'day')).toBe(true);
  });

  it('combines weekends and holidays', () => {
    const holidays = (d: DoranDate) => d.isSame(at(1404, 3, 17), 'day');
    // Thursday + 1: Friday (weekend) and Saturday (holiday) both skipped → Sunday.
    expect(addWorkingDays(at(1404, 3, 15), 1, { holidays }).isSame(at(1404, 3, 18), 'day')).toBe(
      true,
    );
  });

  it('respects a two-day weekend', () => {
    // Wednesday + 1 with Thu+Fri weekend → Saturday.
    expect(
      addWorkingDays(at(1404, 3, 14), 1, { weekends: [5, 6] }).isSame(at(1404, 3, 17), 'day'),
    ).toBe(true);
  });

  it('throws if every day is non-working', () => {
    expect(() => addWorkingDays(at(1404, 3, 10), 1, { weekends: [0, 1, 2, 3, 4, 5, 6] })).toThrow(
      RangeError,
    );
  });
});

describe('nextWorkingDay / previousWorkingDay', () => {
  it('finds the next working day after a Friday', () => {
    expect(nextWorkingDay(at(1404, 3, 16)).isSame(at(1404, 3, 17), 'day')).toBe(true);
  });

  it('finds the previous working day before a Saturday', () => {
    expect(previousWorkingDay(at(1404, 3, 17)).isSame(at(1404, 3, 15), 'day')).toBe(true);
  });
});

describe('workingDaysBetween', () => {
  it('counts working days in a half-open range (start-inclusive, end-exclusive)', () => {
    // [14, 21): 14,15,17,18,19,20 are working (16 is Friday) → 6.
    expect(workingDaysBetween(at(1404, 3, 14), at(1404, 3, 21))).toBe(6);
  });

  it('is order-independent', () => {
    expect(workingDaysBetween(at(1404, 3, 21), at(1404, 3, 14))).toBe(6);
  });

  it('is zero for the same day', () => {
    expect(workingDaysBetween(at(1404, 3, 14), at(1404, 3, 14))).toBe(0);
  });

  it('subtracts holidays', () => {
    const holidays = (d: DoranDate) => d.isSame(at(1404, 3, 17), 'day');
    expect(workingDaysBetween(at(1404, 3, 14), at(1404, 3, 21), { holidays })).toBe(5);
  });
});
