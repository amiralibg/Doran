import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins truthy class values', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('skips falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('drops the number zero like clsx', () => {
    expect(cn('a', 0, 'b')).toBe('a b');
  });

  it('flattens arrays', () => {
    expect(cn('a', ['b', false, ['c', 'd']])).toBe('a b c d');
  });

  it('supports conditional class names', () => {
    const active = true;
    expect(cn('btn', active && 'btn-active')).toBe('btn btn-active');
  });
});
