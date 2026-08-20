import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DoranDatePicker } from './date-picker';
import { DoranRangeDatePicker } from './range-date-picker';

/**
 * jsdom has no layout, so `matchMedia` never matches anything on its own. Stand in
 * for a viewport of `width` so the presentation logic has something to read.
 */
function useViewport(width: number, pointer: 'coarse' | 'fine' = 'fine') {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => {
    const max = /max-width:\s*(\d+)px/.exec(query);
    return {
      matches: query.includes('pointer: coarse')
        ? pointer === 'coarse'
        : max
          ? width <= Number(max[1])
          : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  }) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

let restore: (() => void) | null = null;
afterEach(() => {
  restore?.();
  restore = null;
});

const panel = () => screen.getByRole('dialog');
const openSingle = () => fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));

describe('presentation', () => {
  it('becomes a bottom sheet on a phone without being asked', () => {
    restore = useViewport(390);
    render(<DoranDatePicker />);
    openSingle();

    expect(panel()).toHaveClass('doran-datepicker__popover--sheet');
    expect(panel()).toHaveAttribute('data-presentation', 'sheet');
  });

  it('stays anchored on a wide window', () => {
    restore = useViewport(1280);
    render(<DoranDatePicker />);
    openSingle();

    expect(panel()).not.toHaveClass('doran-datepicker__popover--sheet');
    expect(panel()).toHaveAttribute('data-presentation', 'popover');
  });

  it('honours an explicit mode over the viewport', () => {
    restore = useViewport(390);
    render(<DoranDatePicker mode="popover" />);
    openSingle();

    expect(panel()).not.toHaveClass('doran-datepicker__popover--sheet');
  });

  it('leaves a sheet unpositioned, since CSS pins it to the viewport', () => {
    restore = useViewport(390);
    render(<DoranDatePicker />);
    openSingle();

    // An inline `top`/`left` would fight the stylesheet's `inset: auto 0 0 0`.
    expect(panel().style.top).toBe('');
    expect(panel().style.left).toBe('');
    expect(panel().style.visibility).toBe('');
  });

  it('gives the range picker a sheet too — it is the widest panel here', () => {
    restore = useViewport(390);
    render(<DoranRangeDatePicker />);
    fireEvent.focus(screen.getAllByRole('textbox')[0]!);

    expect(panel()).toHaveClass('doran-datepicker__popover--sheet');
    expect(panel().style.top).toBe('');
  });

  it('does not let the range trigger raise a keyboard over its own sheet', () => {
    restore = useViewport(375, 'coarse');
    render(<DoranRangeDatePicker />);
    const start = screen.getAllByRole('textbox')[0]!;
    fireEvent.focus(start);

    // The sheet fills the lower half of the screen; a keyboard would cover it. The
    // field still has to be focusable, because focus is what opened the sheet.
    expect(panel()).toHaveClass('doran-datepicker__popover--sheet');
    expect(start).toHaveAttribute('readonly');
  });

  it('still lets a narrow desktop window type, keyboard or not', () => {
    // Under 640px this is a sheet too, but a mouse raises no keyboard, so taking
    // typing away would cost something and buy nothing.
    restore = useViewport(375, 'fine');
    render(<DoranRangeDatePicker />);
    const start = screen.getAllByRole('textbox')[0]!;
    fireEvent.focus(start);

    expect(panel()).toHaveClass('doran-datepicker__popover--sheet');
    expect(start).not.toHaveAttribute('readonly');
  });

  it('leaves the range trigger typable on a desktop', () => {
    restore = useViewport(1280, 'fine');
    render(<DoranRangeDatePicker />);
    const start = screen.getAllByRole('textbox')[0]!;
    fireEvent.focus(start);

    expect(start).not.toHaveAttribute('readonly');
  });

  it('keeps the range picker anchored on a wide window', () => {
    restore = useViewport(1280);
    render(<DoranRangeDatePicker />);
    fireEvent.focus(screen.getAllByRole('textbox')[0]!);

    expect(panel()).not.toHaveClass('doran-datepicker__popover--sheet');
  });
});
