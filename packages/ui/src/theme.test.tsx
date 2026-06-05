import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from './theme';

describe('ThemeProvider', () => {
  it('renders children inside an RTL theme root by default', () => {
    render(
      <ThemeProvider>
        <span>سلام</span>
      </ThemeProvider>,
    );
    const root = screen.getByText('سلام').closest('.doran-root')!;
    expect(root).toHaveAttribute('dir', 'rtl');
    expect(root).toHaveAttribute('data-doran-theme', 'light');
  });

  it('applies the theme to the document element', () => {
    render(
      <ThemeProvider defaultMode="dark" direction="ltr">
        <span>x</span>
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute('data-doran-theme', 'dark');
    expect(screen.getByText('x').closest('.doran-root')).toHaveAttribute('dir', 'ltr');
  });

  it('exposes mode and toggles it through the hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.mode).toBe('light');
    act(() => result.current.toggleMode());
    expect(result.current.mode).toBe('dark');
    act(() => result.current.setMode('light'));
    expect(result.current.mode).toBe('light');
  });

  it('throws when useTheme is used outside a provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
  });
});
