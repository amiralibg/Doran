'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from './cn';
import type { Direction, ThemeMode } from './tokens';

interface ThemeContextValue {
  mode: ThemeMode;
  direction: Direction;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Reads the current theme. Must be used within a {@link ThemeProvider}. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return ctx;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Initial color scheme. Defaults to `light`. */
  defaultMode?: ThemeMode;
  /** Text direction. Doran is RTL-first, so this defaults to `rtl`. */
  direction?: Direction;
  /** Extra class names for the wrapping element. */
  className?: string;
}

/**
 * Provides theme context and applies the Doran design-token attributes. Wrap your app
 * (or a subtree) with it and import `@doran/ui/styles.css` once at the root.
 */
export function ThemeProvider({
  children,
  defaultMode = 'light',
  direction = 'rtl',
  className,
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      direction,
      setMode,
      toggleMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    }),
    [mode, direction],
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-doran-theme', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={cn('doran-root', className)} data-doran-theme={mode} dir={direction}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
