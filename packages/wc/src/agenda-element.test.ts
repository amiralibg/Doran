import { DoranDate } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { AgendaEvent, DoranAgendaElement } from './agenda-element';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
});

const UTC = { timeZone: 'UTC' };

function mount(attrs: Record<string, string> = {}): DoranAgendaElement {
  const el = document.createElement('doran-agenda') as DoranAgendaElement;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

const events: AgendaEvent[] = [
  { id: 'a', date: DoranDate.fromJalali(1405, 3, 1, UTC), title: 'جلسه تیم' },
  { id: 'b', date: DoranDate.fromJalali(1405, 3, 3, UTC), title: 'تولد' },
];

describe('<doran-agenda>', () => {
  it('renders the requested number of day sections', () => {
    const el = mount({ start: '1405/03/01', days: '5' });
    expect(el.querySelectorAll('.doran-agenda__day')).toHaveLength(5);
  });

  it('places events on their day and shows an empty state otherwise', () => {
    const el = mount({ start: '1405/03/01', days: '3' });
    el.events = events;
    expect(el.textContent).toContain('جلسه تیم');
    expect(el.textContent).toContain('تولد');
    expect(el.querySelectorAll('.doran-agenda__empty')).toHaveLength(1);
  });

  it('emits a selectday event with the clicked day', () => {
    const el = mount({ start: '1405/03/01', days: '3' });
    const onSelect = vi.fn();
    el.addEventListener('selectday', (e) => onSelect((e as CustomEvent).detail));
    el.querySelectorAll<HTMLButtonElement>('.doran-agenda__date')[2]!.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    const detail = onSelect.mock.calls[0]![0] as { date: DoranDate };
    expect([detail.date.year, detail.date.month, detail.date.day]).toEqual([1405, 3, 3]);
  });

  it('uses a custom renderEvent formatter', () => {
    const el = mount({ start: '1405/03/01', days: '1' });
    el.renderEvent = (e) => `<p data-testid="custom">${e.title}!</p>`;
    el.events = events;
    const custom = el.querySelector('[data-testid="custom"]')!;
    expect(custom.textContent).toBe('جلسه تیم!');
  });
});
