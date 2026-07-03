import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';

// The Angular binding relies on this custom-element contract: element *properties*
// (value / events / start / renderEvent) only take effect once `@doranjs/wc` has
// upgraded the element. Assigning them before upgrade is silently lost — which is
// why every binding gates its property writes behind a post-upgrade `ready` flag
// (`ensureElements().then(() => this.syncEl())`). This guards that invariant.
describe('wc upgrade contract (why the binding syncs post-upgrade)', () => {
  it('property set BEFORE upgrade is lost', async () => {
    const el = document.createElement('doran-agenda') as HTMLElement & { events: unknown };
    document.body.appendChild(el);
    const start = DoranDate.now().startOf('week');
    el.events = [{ id: '1', date: start, title: 'PRE-UPGRADE' }];

    await import('@doranjs/wc');
    await new Promise((r) => setTimeout(r, 50));

    expect(el.innerHTML).not.toContain('PRE-UPGRADE');
    el.remove();
  });

  it('property set AFTER upgrade renders (what the binding does)', async () => {
    await import('@doranjs/wc');
    const el = document.createElement('doran-agenda') as HTMLElement & {
      start: DoranDate;
      events: unknown;
    };
    document.body.appendChild(el);
    const start = DoranDate.now().startOf('week');
    el.start = start;
    el.events = [{ id: '2', date: start, title: 'POST-UPGRADE' }];
    await new Promise((r) => setTimeout(r, 50));

    expect(el.innerHTML).toContain('POST-UPGRADE');
    el.remove();
  });
});
