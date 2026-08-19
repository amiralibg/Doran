import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { type DoranDatePickerElement } from './datepicker-element';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('[role="dialog"]').forEach((n) => n.remove());
  vi.restoreAllMocks();
});

function mount(attrs: Record<string, string> = {}): DoranDatePickerElement {
  const el = document.createElement('doran-datepicker') as DoranDatePickerElement;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

const control = (el: HTMLElement) => el.querySelector<HTMLElement>('.doran-datepicker__control')!;
const icon = (el: HTMLElement) => el.querySelector<HTMLButtonElement>('.doran-datepicker__icon')!;
const dialog = () => document.querySelector('[role="dialog"]');

/** Pretends the primary pointer is a finger, which the keyboard avoidance keys off. */
function coarsePointer(coarse: boolean): void {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('pointer: coarse') ? coarse : false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
}

describe('editable="false"', () => {
  it('renders a button trigger instead of a text field', () => {
    const el = mount({ editable: 'false', value: '1402/05/12' });

    expect(el.querySelector('input.doran-datepicker__control')).toBeNull();
    expect(control(el).tagName).toBe('BUTTON');
    expect(control(el).textContent).toContain('۱۴۰۲/۰۵/۱۲');
  });

  it('opens the calendar when the trigger itself is activated', () => {
    const el = mount({ editable: 'false' });

    expect(dialog()).toBeNull();
    control(el).click();

    expect(dialog()).not.toBeNull();
    expect(control(el).getAttribute('aria-expanded')).toBe('true');
  });

  it('shows the placeholder while empty', () => {
    const el = mount({ editable: 'false', placeholder: 'تاریخ تولد' });

    expect(control(el).querySelector('.doran-datepicker__placeholder')?.textContent).toBe(
      'تاریخ تولد',
    );
  });

  it('retitles the trigger when the value changes underneath it', () => {
    const el = mount({ editable: 'false' });
    el.setAttribute('value', '1403/01/01');

    expect(control(el).textContent).toContain('۱۴۰۳/۰۱/۰۱');
  });

  it('keeps a text field when the attribute is absent or not "false"', () => {
    expect(control(mount()).tagName).toBe('INPUT');
    expect(control(mount({ editable: 'true' })).tagName).toBe('INPUT');
  });

  it('survives the blur that pressing a day causes', () => {
    // The real-browser failure this guards: pressing a day blurs the trigger, and
    // blur used to re-render — destroying the pop-over before the click landed, so
    // picking a date did nothing at all.
    const el = mount({ editable: 'false' });
    control(el).click();
    const before = document.querySelector('[role="dialog"]');
    expect(before).not.toBeNull();

    control(el).dispatchEvent(new FocusEvent('blur', { bubbles: false }));

    expect(document.querySelector('[role="dialog"]')).toBe(before);
  });

  it('selects a day picked from the grid', () => {
    const el = mount({ editable: 'false' });
    control(el).click();
    document.querySelector<HTMLButtonElement>('[role="dialog"] .doran-day')!.click();

    expect(el.value).not.toBeNull();
    expect(control(el).textContent).not.toBe('');
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('does not let Enter close and its own click re-open', () => {
    const el = mount({ editable: 'false' });
    control(el).click();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    // A button fires keydown and then click for the same Enter press. Re-query
    // between the two: a render without focus on the trigger rebuilds the markup.
    control(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    control(el).click();

    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('stays shut while disabled', () => {
    const el = mount({ editable: 'false', disabled: '' });

    control(el).click();
    expect(dialog()).toBeNull();
  });
});

describe('on-screen keyboard avoidance', () => {
  it('drops focus from the text field when the calendar opens on touch', () => {
    coarsePointer(true);
    const el = mount();
    const field = control(el);
    field.focus();
    expect(document.activeElement).toBe(field);

    icon(el).click();

    expect(document.activeElement).not.toBe(field);
    expect(dialog()).not.toBeNull();
  });

  it('keeps the caret where it is on a mouse-driven screen', () => {
    coarsePointer(false);
    const el = mount();
    const field = control(el);
    field.focus();

    icon(el).click();

    expect(document.activeElement).toBe(field);
  });

  it('leaves a button trigger focused on touch, having raised no keyboard', () => {
    coarsePointer(true);
    const el = mount({ editable: 'false' });
    const field = control(el);
    field.focus();

    field.click();

    expect(document.activeElement).toBe(field);
  });
});
