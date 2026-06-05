import { afterEach, describe, expect, it } from 'vitest';
import { defineDoranElements, TAG_NAMES } from './register';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('defineDoranElements', () => {
  it('registers every Doran custom element tag', () => {
    defineDoranElements();
    for (const tag of Object.values(TAG_NAMES)) {
      expect(customElements.get(tag)).toBeTypeOf('function');
    }
  });

  it('is idempotent (safe to call more than once)', () => {
    expect(() => {
      defineDoranElements();
      defineDoranElements();
    }).not.toThrow();
  });

  it('upgrades a tag placed in the document', () => {
    defineDoranElements();
    document.body.innerHTML = '<doran-calendar value="1405/03/15"></doran-calendar>';
    const el = document.querySelector(TAG_NAMES.calendar)!;
    // Upgraded elements render their light-DOM grid synchronously on connect.
    expect(el.querySelector('.doran-month')).not.toBeNull();
  });
});
