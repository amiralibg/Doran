import { DoranDate } from '@doranjs/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DoranCalendar } from './calendar';
import { DoranDatePicker } from './date-picker';

const UTC = { timeZone: 'UTC' };
const value = DoranDate.fromJalali(1405, 3, 15, UTC);

function openPopover() {
  fireEvent.click(screen.getByRole('button', { name: /۱۴۰۵/ }));
  return screen.getByRole('dialog');
}

describe('trigger accessible name', () => {
  it('names the field, not just its digits', () => {
    render(<DoranDatePicker placeholder="تاریخ تولد" />);
    expect(screen.getByRole('button', { name: 'تاریخ تولد' })).toBeInTheDocument();
  });

  // aria-label replaces the button's text rather than adding to it, so naming the
  // field must not cost the value.
  it('announces both the field and the current value', () => {
    render(<DoranDatePicker placeholder="تاریخ تولد" defaultValue={value} />);
    const trigger = screen.getByRole('button', { name: /تاریخ تولد/ });
    expect(trigger.getAttribute('aria-label')).toContain('تاریخ تولد');
    expect(trigger.getAttribute('aria-label')).toContain('۱۴۰۵/۰۳/۱۵');
  });

  it('lets an explicit aria-label override the placeholder', () => {
    render(<DoranDatePicker placeholder="تاریخ تولد" aria-label="از تاریخ" />);
    expect(screen.getByRole('button', { name: 'از تاریخ' })).toBeInTheDocument();
  });

  it('defers entirely to aria-labelledby when given', () => {
    render(
      <>
        <span id="lbl">تاریخ سفارش</span>
        <DoranDatePicker aria-labelledby="lbl" />
      </>,
    );
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-labelledby', 'lbl');
    expect(trigger).not.toHaveAttribute('aria-label');
  });
});

describe('non-modal popover keyboard behaviour', () => {
  // The popover declares aria-modal="false", promising assistive technology the rest
  // of the page is reachable. A focus trap broke that promise.
  it('closes when Tab moves past the last focusable element', () => {
    render(<DoranDatePicker defaultValue={value} />);
    const dialog = openPopover();

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const last = focusable[focusable.length - 1]!;
    act(() => last.focus());
    fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes back onto the trigger when Shift+Tab leaves the front', () => {
    render(<DoranDatePicker defaultValue={value} />);
    const dialog = openPopover();

    const first = dialog.querySelector<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )!;
    act(() => first.focus());
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /۱۴۰۵/ })).toHaveFocus();
  });

  it('leaves Tab alone in the middle of the popover', () => {
    render(<DoranDatePicker defaultValue={value} />);
    const dialog = openPopover();

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    act(() => focusable[1]!.focus());
    fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('still closes on Escape and restores focus to the trigger', () => {
    render(<DoranDatePicker defaultValue={value} />);
    openPopover();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /۱۴۰۵/ })).toHaveFocus();
  });
});

describe('day navigation live region', () => {
  it('stays silent until the grid has focus', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={value} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    expect(container.querySelector('.doran-month__live')).toHaveTextContent('');
  });

  it('announces the focused day, including across a month boundary', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={value} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    const grid = screen.getByRole('grid');
    const live = container.querySelector('.doran-month__live')!;

    fireEvent.focus(grid);
    expect(live.textContent).toContain('خرداد');

    // Page back a month: the grid re-renders wholesale, which is exactly the case
    // DOM-focus announcements miss.
    fireEvent.keyDown(grid, { key: 'PageUp' });
    expect(live.textContent).toContain('اردیبهشت');
  });

  it('is exposed as a polite status region', () => {
    const { container } = render(
      <DoranCalendar timeZone="UTC" today={value} defaultMonth={{ year: 1405, month: 3 }} />,
    );
    const live = container.querySelector('.doran-month__live')!;
    expect(live).toHaveAttribute('role', 'status');
    expect(live).toHaveAttribute('aria-live', 'polite');
  });
});
