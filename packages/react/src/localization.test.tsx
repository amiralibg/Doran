import { DoranDate, enUS, faIR, setDefaultLocale, type Locale } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DoranCalendar } from './calendar';
import { DoranDatePicker } from './date-picker';
import { DoranRangePicker } from './range-picker';
import { defaultRangePresets } from './presets';

const UTC = { timeZone: 'UTC' };
const value = DoranDate.fromJalali(1405, 3, 15, UTC);

afterEach(() => setDefaultLocale(faIR));

// The reviewer's exact complaint: `setDefaultLocale(enUS)` still produced an RTL
// widget whose dialog announced «تقویم».
describe('setDefaultLocale(enUS)', () => {
  it('produces a left-to-right widget', () => {
    setDefaultLocale(enUS);
    const { container } = render(<DoranDatePicker />);

    expect(container.querySelector('.doran-datepicker')).toHaveAttribute('dir', 'ltr');
  });

  it('announces the calendar in English', () => {
    setDefaultLocale(enUS);
    render(<DoranDatePicker defaultValue={value} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    const dialog = screen.getByRole('dialog', { name: 'Calendar' });
    expect(dialog).toHaveAttribute('dir', 'ltr');
  });

  it('uses English for the placeholder and every control', () => {
    setDefaultLocale(enUS);
    render(<DoranDatePicker withTime footerActions={['today', 'clear']} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Pick a date');
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));

    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Hour' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase Hour' })).toBeInTheDocument();
  });

  it('localizes the range summary and preset labels', () => {
    setDefaultLocale(enUS);
    const { container } = render(<DoranRangePicker presets />);

    expect(container.querySelector('.doran-rangepicker__summary')?.textContent).toContain(' to ');
    expect(screen.getByRole('group', { name: 'Quick ranges' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last 7 days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'This month' })).toBeInTheDocument();
  });
});

describe('direction', () => {
  it('defaults to rtl for the Persian locale', () => {
    const { container } = render(<DoranCalendar locale={faIR} />);
    expect(container.querySelector('.doran-calendar')).toHaveAttribute('dir', 'rtl');
  });

  it('lets an explicit dir prop override the locale', () => {
    const { container } = render(<DoranCalendar locale={enUS} dir="rtl" />);
    expect(container.querySelector('.doran-calendar')).toHaveAttribute('dir', 'rtl');
  });

  // Arrow keys follow the reading direction, so ArrowLeft must not advance in LTR.
  it('flips arrow-key navigation with the direction', () => {
    const { container } = render(
      <DoranCalendar
        locale={enUS}
        timeZone="UTC"
        today={value}
        defaultMonth={{ year: 1405, month: 3 }}
      />,
    );
    const grid = screen.getByRole('grid');

    fireEvent.focus(grid);
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });

    // LTR: ArrowLeft goes back, so the 1st stays put rather than advancing to the 2nd.
    expect(container.querySelector('[data-cell-date="1405-3-2"]')).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('keeps rtl for a locale written before `direction` existed', () => {
    const legacy = { ...faIR, direction: undefined } as Locale;
    const { container } = render(<DoranCalendar locale={legacy} />);
    expect(container.querySelector('.doran-calendar')).toHaveAttribute('dir', 'rtl');
  });
});

describe('custom locales', () => {
  it('takes label overrides and falls back for the rest', () => {
    const custom: Locale = {
      ...enUS,
      calendarLabels: { today: 'Now', datePlaceholder: 'When?' },
    };
    render(<DoranDatePicker locale={custom} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'When?');
    // Labels the custom locale left out fall back to Persian rather than to blank —
    // including the one that opens the calendar.
    fireEvent.click(screen.getByRole('button', { name: 'باز کردن تقویم' }));
    expect(screen.getByRole('button', { name: 'Now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ماه قبل' })).toBeInTheDocument();
  });

  it('formats preset numerals through the locale', () => {
    expect(defaultRangePresets(faIR)[0]!.label).toBe('۷ روز اخیر');
    expect(defaultRangePresets(enUS)[0]!.label).toBe('Last 7 days');
  });
});
