import { DoranDate } from '@doranjs/core';
import { createApp, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { DoranCalendar, DoranRangePicker } from './components';

// `dayData` and `disabledDates` are element properties, not attributes — an object
// and a function can't be stringified. Vue only infers that once the custom element
// has upgraded, and the lazy `import('@doranjs/wc')` resolves after the first render,
// so the binding has to assign them itself afterwards.
async function mount(component: unknown, props: Record<string, unknown>) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const app = createApp({ render: () => h(component as never, props) });
  app.mount(host);
  await new Promise((r) => setTimeout(r, 400));
  return {
    host,
    cleanup: () => {
      app.unmount();
      host.remove();
    },
  };
}

describe('DoranCalendar day widgets', () => {
  it('applies dayData onto the element after upgrade', async () => {
    const value = DoranDate.fromJalali({ year: 1405, month: 3, day: 15 });
    const { host, cleanup } = await mount(DoranCalendar, {
      modelValue: value,
      dayData: { '1405-3-12': { text: 'FARE-ALPHA', tone: 'low' } },
      locale: 'fa',
    });

    const cell = host.querySelector('[data-y="1405"][data-m="3"][data-d="12"]')!;
    expect(cell.querySelector('.doran-day__content')?.textContent).toBe('FARE-ALPHA');
    expect(cell.querySelector('.doran-day__content')?.getAttribute('data-tone')).toBe('low');

    cleanup();
  });

  it('applies the disabledDates predicate after upgrade', async () => {
    const value = DoranDate.fromJalali({ year: 1405, month: 3, day: 15 });
    const { host, cleanup } = await mount(DoranCalendar, {
      modelValue: value,
      disabledDates: (day: DoranDate) => day.day === 12,
      locale: 'fa',
    });

    expect(
      host.querySelector('[data-y="1405"][data-m="3"][data-d="12"]')!.getAttribute('aria-disabled'),
    ).toBe('true');
    expect(
      host.querySelector('[data-y="1405"][data-m="3"][data-d="13"]')!.hasAttribute('aria-disabled'),
    ).toBe(false);

    cleanup();
  });

  it('passes slot children through to the element', async () => {
    const value = DoranDate.fromJalali({ year: 1405, month: 3, day: 15 });
    const host = document.createElement('div');
    document.body.appendChild(host);
    const app = createApp({
      render: () =>
        h(DoranCalendar, { modelValue: value, locale: 'fa' }, () => [
          h('div', { slot: 'legend', id: 'lg' }, 'LEGEND-TEXT'),
        ]),
    });
    app.mount(host);
    await new Promise((r) => setTimeout(r, 400));

    const legend = host.querySelector('.doran-calendar__legend');
    expect(legend?.textContent).toContain('LEGEND-TEXT');

    app.unmount();
    host.remove();
  });
});

describe('DoranRangePicker day widgets', () => {
  it('applies dayData onto the element after upgrade', async () => {
    const today = DoranDate.now();
    const key = `${today.year}-${today.month}-${today.day}`;
    const { host, cleanup } = await mount(DoranRangePicker, {
      dayData: { [key]: { text: 'ROOMS-2' } },
      locale: 'fa',
    });

    const cell = host.querySelector(
      `[data-y="${today.year}"][data-m="${today.month}"][data-d="${today.day}"]`,
    )!;
    expect(cell.querySelector('.doran-day__content')?.textContent).toBe('ROOMS-2');

    cleanup();
  });
});
