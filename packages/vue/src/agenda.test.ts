import { DoranDate } from '@doranjs/core';
import { createApp, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { DoranAgenda } from './components';

// `start`/`events`/`renderEvent` are element properties, not attributes, so the
// binding must assign them after the lazy `@doranjs/wc` import upgrades the
// element. Regression guard: passing them through attrs used to drop them.
describe('DoranAgenda client-side', () => {
  it('applies start + events onto the element after upgrade', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const start = DoranDate.fromJalali({ year: 1405, month: 1, day: 1 });
    const events = [
      { id: '1', date: start.addDays(1), title: 'EVENT-ALPHA' },
      { id: '2', date: start.addDays(3), title: 'EVENT-BETA' },
    ];

    const app = createApp({
      render: () => h(DoranAgenda, { start, events, days: 7, locale: 'fa' }),
    });
    app.mount(host);
    // Let the binding's lazy `import('@doranjs/wc')` + upgrade settle.
    await new Promise((r) => setTimeout(r, 400));

    const html = host.querySelector('doran-agenda')!.innerHTML;
    expect(html).toContain('EVENT-ALPHA');
    expect(html).toContain('EVENT-BETA');

    app.unmount();
    host.remove();
  });

  it('renders custom event HTML via renderEvent', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const start = DoranDate.fromJalali({ year: 1405, month: 1, day: 1 });
    const app = createApp({
      render: () =>
        h(DoranAgenda, {
          start,
          events: [{ id: '1', date: start, title: 'X' }],
          renderEvent: (e: { title: string }) => `<b class="pill">${e.title}</b>`,
          locale: 'fa',
        }),
    });
    app.mount(host);
    await new Promise((r) => setTimeout(r, 400));

    expect(host.querySelector('doran-agenda')!.innerHTML).toContain('<b class="pill">X</b>');

    app.unmount();
    host.remove();
  });
});
