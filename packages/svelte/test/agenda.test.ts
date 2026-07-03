import { DoranDate } from '@doranjs/core';
import { flushSync, mount, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';
import DoranAgenda from '../src/lib/DoranAgenda.svelte';

// `start`/`events`/`renderEvent` are element properties, not attributes, so the
// binding must assign them after the lazy `@doranjs/wc` import upgrades the
// element. Regression guard: spreading them via `$$restProps` used to drop them.
describe('DoranAgenda client-side', () => {
  it('applies start + events onto the element after upgrade', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    const start = DoranDate.fromJalali({ year: 1405, month: 1, day: 1 });
    const events = [
      { id: '1', date: start.addDays(1), title: 'EVENT-ALPHA' },
      { id: '2', date: start.addDays(3), title: 'EVENT-BETA' },
    ];

    const comp = mount(DoranAgenda, { target, props: { start, events, days: 7, locale: 'fa' } });
    flushSync();
    await new Promise((r) => setTimeout(r, 400));

    const html = target.querySelector('doran-agenda')!.innerHTML;
    expect(html).toContain('EVENT-ALPHA');
    expect(html).toContain('EVENT-BETA');

    unmount(comp);
    target.remove();
  });

  it('renders custom event HTML via renderEvent', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    const start = DoranDate.fromJalali({ year: 1405, month: 1, day: 1 });
    const comp = mount(DoranAgenda, {
      target,
      props: {
        start,
        events: [{ id: '1', date: start, title: 'X' }],
        renderEvent: (e: { title: string }) => `<b class="pill">${e.title}</b>`,
        locale: 'fa',
      },
    });
    flushSync();
    await new Promise((r) => setTimeout(r, 400));

    expect(target.querySelector('doran-agenda')!.innerHTML).toContain('<b class="pill">X</b>');

    unmount(comp);
    target.remove();
  });
});
