import { enUS, faIR } from '@doranjs/core';
import { render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { buildMonthGrid } from './grid';
import { DoranMonthView } from './month-view';
import { DoranProvider, useResolvedLocale } from './provider';

describe('DoranProvider / useResolvedLocale', () => {
  it('resolves prop → provider → global default', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DoranProvider locale={enUS}>{children}</DoranProvider>
    );
    // No prop → provider wins.
    expect(renderHook(() => useResolvedLocale(), { wrapper }).result.current).toBe(enUS);
    // Explicit prop wins over provider.
    expect(renderHook(() => useResolvedLocale(faIR), { wrapper }).result.current).toBe(faIR);
    // No provider → global default (faIR).
    expect(renderHook(() => useResolvedLocale()).result.current).toBe(faIR);
  });

  it('feeds locale into a subtree component (Latin digits under enUS)', () => {
    render(
      <DoranProvider locale={enUS}>
        <DoranMonthView grid={buildMonthGrid(1403, 1)} />
      </DoranProvider>,
    );
    // Latin "1" would be Persian "۱" under the default fa locale.
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });
});
