# Testing with Doran

Anything that reads "now" — `DoranDate.now()`, `today`, `isToday`, `fromNow`,
`isBetween(now)` — is hard to test when the clock keeps moving. Doran ships a
freezable clock so you can pin "now" **without monkey-patching the global `Date`**
(no `MockDate`, no `jest.useFakeTimers()` required).

## `freeze` — pin the clock for one block

```ts
import { DoranDate, freeze } from '@doranjs/core';

freeze(DoranDate.fromJalali(1405, 1, 1), () => {
  DoranDate.now().format('YYYY/MM/DD'); // always "۱۴۰۵/۰۱/۰۱"
  DoranDate.fromJalali(1405, 1, 1).isToday(); // true
});
// outside the block, now() is the real time again
```

`freeze` restores the previous clock automatically — even if the callback throws,
and even if it's `async` (the clock is restored when the returned promise settles):

```ts
await freeze(fixed, async () => {
  await doSomethingThatReadsNow();
});
```

## `setNow` / `resetNow` — pin the clock for a whole suite

`setNow` accepts a fixed instant (`number` epoch ms, `Date`, or `DoranDate`) or a
function re-evaluated on every read (for a controllable, advancing clock).

### Vitest

```ts
import { afterEach, expect, it } from 'vitest';
import { DoranDate } from '@doranjs/core';

afterEach(() => DoranDate.resetNow());

it('greets based on the frozen day', () => {
  DoranDate.setNow(DoranDate.fromJalali(1405, 1, 1));
  expect(DoranDate.now().format('dddd')).toBe('شنبه');
});

it('advances time under control', () => {
  let clock = Date.UTC(2026, 0, 1);
  DoranDate.setNow(() => clock); // function source — re-read each call
  const a = DoranDate.now();
  clock += 86_400_000; // +1 day
  expect(DoranDate.now().diff(a, 'day')).toBe(1);
});
```

### Jest

```ts
import { DoranDate } from '@doranjs/core';

afterEach(() => DoranDate.resetNow());

test('fromNow is deterministic', () => {
  DoranDate.setNow(DoranDate.fromJalali(1405, 1, 1));
  expect(DoranDate.fromJalali(1405, 1, 1).addDays(-1).fromNow()).toBe('یک روز پیش');
});
```

::: tip Always reset
Call `DoranDate.resetNow()` in `afterEach` (or use `freeze`, which auto-restores) so
a frozen clock never leaks into the next test.
:::
