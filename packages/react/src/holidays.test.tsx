import { DoranDate } from '@doranjs/core';
import { SOLAR_HOLIDAYS } from '@doranjs/holidays';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DoranCalendar } from './calendar';
import { createHolidayHelpers, useHolidays } from './holidays';

const UTC = { timeZone: 'UTC' };

// 1 Farvardin — Nowruz, the least ambiguous official holiday in the calendar.
const nowruz = DoranDate.fromJalali(1405, 1, 1, UTC);
const ordinaryDay = DoranDate.fromJalali(1405, 1, 5, UTC);

describe('createHolidayHelpers', () => {
  it('recognizes an official public holiday', () => {
    const { isHoliday } = createHolidayHelpers();
    expect(isHoliday(nowruz)).toBe(true);
    expect(isHoliday(ordinaryDay)).toBe(false);
  });

  it('returns the holidays falling on a day', () => {
    const { holidaysOn } = createHolidayHelpers();
    const found = holidaysOn(nowruz);
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]!.title).toBeTruthy();
  });

  it('surfaces the name as a tooltip and accessible label', () => {
    const { dayProps } = createHolidayHelpers();
    const props = dayProps(nowruz, {} as never)!;

    expect(props.title).toBeTruthy();
    expect(props.label).toBe(props.title);
    expect(props['data-holiday']).toBe('true');
    expect(dayProps(ordinaryDay, {} as never)).toBeUndefined();
  });

  it('uses English titles when asked', () => {
    const fa = createHolidayHelpers().dayProps(nowruz, {} as never)!;
    const en = createHolidayHelpers({ language: 'en' }).dayProps(nowruz, {} as never)!;
    expect(en.title).not.toBe(fa.title);
    expect(en.title).toMatch(/[A-Za-z]/);
  });

  // Official-only is the default because that is what `isHoliday` means in
  // @doranjs/holidays: a day people actually get off.
  it('marks observances only when officialOnly is off', () => {
    const unofficial = SOLAR_HOLIDAYS.find((holiday) => !holiday.official)!;
    const day = DoranDate.fromJalali(1405, unofficial.month, unofficial.day, UTC);

    expect(createHolidayHelpers({ officialOnly: false }).isHoliday(day)).toBe(true);
    expect(createHolidayHelpers().isHoliday(day)).toBe(false);
  });

  it('drops unofficial days entirely when includeUnofficial is off', () => {
    const unofficial = SOLAR_HOLIDAYS.find((holiday) => !holiday.official)!;
    const day = DoranDate.fromJalali(1405, unofficial.month, unofficial.day, UTC);

    const helpers = createHolidayHelpers({ officialOnly: false, includeUnofficial: false });
    expect(helpers.holidaysOn(day)).toHaveLength(0);
  });

  it('flags lunar dates that are arithmetically approximated', () => {
    const { holidaysOn, dayProps } = createHolidayHelpers();
    // Search a year with no official override for an approximate lunar holiday.
    const year = 1410;
    let approximate: DoranDate | null = null;
    for (let month = 1; month <= 12 && !approximate; month += 1) {
      for (let day = 1; day <= 29; day += 1) {
        const date = DoranDate.fromJalali(year, month, day, UTC);
        if (holidaysOn(date).some((h) => h.approximate && h.official)) {
          approximate = date;
          break;
        }
      }
    }

    expect(approximate).not.toBeNull();
    expect(dayProps(approximate!, {} as never)!['data-approximate']).toBe('true');
  });

  // getHolidaysOn() rebuilds an entire year per call, which a month grid would do 42
  // times per render. The helpers exist largely to make that a one-time cost per
  // year — proven here by identity: a cached year hands back the same array.
  it('resolves each year once, however many days are queried', () => {
    const helpers = createHolidayHelpers();

    expect(helpers.holidaysOn(nowruz)).toBe(helpers.holidaysOn(nowruz));
    // A separate helper has its own cache, so its arrays are distinct.
    expect(helpers.holidaysOn(nowruz)).not.toBe(createHolidayHelpers().holidaysOn(nowruz));
  });

  it('caches each year independently', () => {
    const helpers = createHolidayHelpers();
    const first = helpers.holidaysOn(nowruz);
    const nextYear = helpers.holidaysOn(DoranDate.fromJalali(1406, 1, 1, UTC));

    expect(nextYear[0]!.year).toBe(1406);
    // Reading a second year must not evict the first.
    expect(helpers.holidaysOn(nowruz)).toBe(first);
  });
});

describe('useHolidays', () => {
  it('marks holiday days in a rendered calendar', () => {
    function Calendar() {
      const holidays = useHolidays();
      return (
        <DoranCalendar
          timeZone="UTC"
          today={nowruz}
          defaultMonth={{ year: 1405, month: 1 }}
          isHoliday={holidays.isHoliday}
          dayProps={holidays.dayProps}
        />
      );
    }

    const { container } = render(<Calendar />);
    const first = container.querySelector<HTMLButtonElement>('[data-cell-date="1405-1-1"]')!;

    expect(first).toHaveClass('doran-day--holiday');
    expect(first).toHaveAttribute('data-holiday', 'true');
    expect(first.getAttribute('title')).toBeTruthy();
    // The holiday name joins the date rather than replacing it.
    expect(first.getAttribute('aria-label')).toContain('فروردین');
    expect(first.getAttribute('aria-label')).toContain(first.getAttribute('title')!);
  });

  it('leaves ordinary days untouched', () => {
    function Calendar() {
      const holidays = useHolidays();
      return (
        <DoranCalendar
          timeZone="UTC"
          today={nowruz}
          defaultMonth={{ year: 1405, month: 1 }}
          isHoliday={holidays.isHoliday}
          dayProps={holidays.dayProps}
        />
      );
    }

    render(<Calendar />);
    const ordinary = screen
      .getByRole('grid')
      .querySelector<HTMLButtonElement>('[data-cell-date="1405-1-5"]')!;

    expect(ordinary).not.toHaveClass('doran-day--holiday');
    expect(ordinary).not.toHaveAttribute('data-holiday');
  });
});
