import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('[role="dialog"]').forEach((n) => n.remove());
  vi.restoreAllMocks();
});

/** jsdom has no layout, so stand in for a viewport of `width`. */
function viewport(width: number): void {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
    const max = /max-width:\s*(\d+)px/.exec(query);
    return {
      matches: max ? width <= Number(max[1]) : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  });
}

function mount(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

const panel = () => document.querySelector('[role="dialog"]')!;
const openVia = (el: HTMLElement, sel: string) => el.querySelector<HTMLElement>(sel)!.click();

describe('presentation', () => {
  it('becomes a bottom sheet on a phone without being asked', () => {
    viewport(390);
    const el = mount('doran-datepicker');
    openVia(el, '.doran-datepicker__icon');

    expect(panel().className).toContain('doran-datepicker__popover--sheet');
    expect(panel().getAttribute('data-presentation')).toBe('sheet');
  });

  it('stays anchored on a wide window', () => {
    viewport(1280);
    const el = mount('doran-datepicker');
    openVia(el, '.doran-datepicker__icon');

    expect(panel().className).not.toContain('--sheet');
    expect(panel().getAttribute('data-presentation')).toBe('popover');
  });

  it('honours an explicit mode over the viewport', () => {
    viewport(390);
    const el = mount('doran-datepicker', { mode: 'popover' });
    openVia(el, '.doran-datepicker__icon');

    expect(panel().className).not.toContain('--sheet');
  });

  it('gives the range picker a sheet too', () => {
    viewport(390);
    const el = mount('doran-rangedatepicker');
    const field = el.querySelector<HTMLInputElement>('.doran-rangetrigger__control, input')!;
    field.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(panel().className).toContain('doran-datepicker__popover--sheet');
  });
});
