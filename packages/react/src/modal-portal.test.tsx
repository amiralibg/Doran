import { DoranDate } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { DoranDatePicker } from './date-picker';
import { DoranNlpInput } from './nlp-input';
import { DoranRangeDatePicker } from './range-date-picker';

/**
 * Everything Doran portals to <body> has to survive a modal Radix layer.
 *
 * Dialog, AlertDialog, a shadcn Sheet and a vaul Drawer all open with
 * `disableOutsidePointerEvents`, which sets `pointer-events: none` on <body> and
 * exempts only the layer's own subtree. A body-portaled pop-over inherits that
 * `none`: it still paints on top, but the tap hit-tests through to <html>, the
 * picker's outside-pointerdown dismissal sees a target it does not own, and the
 * calendar closes without selecting anything. The stylesheet opts each portaled
 * surface back in with `pointer-events: auto`.
 *
 * WHAT THIS TEST CAN AND CANNOT DO — please read before "strengthening" it.
 * jsdom does no layout and no hit-testing, so a click-through test cannot
 * reproduce the bug: firing a click on a day always dispatches on that day
 * whatever `pointer-events` says, and would pass just as happily against the
 * broken stylesheet. The computed style is the only observable that actually
 * changes when the fix is reverted, so that is what is asserted here. The
 * `inherits the body's "none"` case below is the control: it proves the
 * stylesheet is really loaded and really cascading, so a green `auto` means the
 * rule matched rather than that jsdom ignored the CSS.
 */

/*
 * Read off disk rather than imported: vitest stubs CSS imports to an empty string
 * unless `test.css` is on, and an empty stylesheet would make every assertion below
 * pass for the wrong reason. readFileSync throws loudly if the path ever moves.
 */
const CSS = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

beforeAll(() => {
  const style = document.createElement('style');
  style.id = 'doran-styles';
  style.textContent = CSS;
  document.head.appendChild(style);
});

/** Stands in for the modal Radix layer, which owns <body> while it is open. */
function openModalLayer() {
  document.body.style.pointerEvents = 'none';
}

afterEach(() => {
  document.body.style.pointerEvents = '';
});

describe('body-portaled surfaces inside a modal Radix layer', () => {
  it('inherits the body’s "none" on anything not opted out', () => {
    openModalLayer();
    const plain = document.createElement('div');
    document.body.appendChild(plain);
    expect(getComputedStyle(plain).pointerEvents).toBe('none');
    plain.remove();
  });

  it('keeps the date picker pop-over interactive', () => {
    openModalLayer();
    render(<DoranDatePicker withTime />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    expect(getComputedStyle(screen.getByRole('dialog')).pointerEvents).toBe('auto');
  });

  it('keeps the range picker pop-over interactive', () => {
    openModalLayer();
    render(<DoranRangeDatePicker />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    expect(getComputedStyle(screen.getByRole('dialog')).pointerEvents).toBe('auto');
  });

  it('keeps the NLP suggestion list interactive', () => {
    openModalLayer();
    render(<DoranNlpInput reference={DoranDate.fromJalali(1405, 3, 15, { timeZone: 'UTC' })} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'فرد' } });
    expect(getComputedStyle(screen.getByRole('listbox')).pointerEvents).toBe('auto');
  });
});
