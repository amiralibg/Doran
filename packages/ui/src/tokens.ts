/**
 * Design tokens for the Doran design system. These mirror the CSS custom properties
 * declared in `styles.css`, so they can be referenced from JS (e.g. inline styles or
 * a Tailwind preset) while the source of truth for theming stays in CSS.
 */
export const tokens = {
  color: {
    bg: 'var(--doran-bg)',
    surface: 'var(--doran-surface)',
    surfaceMuted: 'var(--doran-surface-muted)',
    border: 'var(--doran-border)',
    text: 'var(--doran-text)',
    textMuted: 'var(--doran-text-muted)',
    primary: 'var(--doran-primary)',
    primaryHover: 'var(--doran-primary-hover)',
    primaryContrast: 'var(--doran-primary-contrast)',
    accent: 'var(--doran-accent)',
    danger: 'var(--doran-danger)',
    focusRing: 'var(--doran-focus-ring)',
  },
  radius: {
    sm: 'var(--doran-radius-sm)',
    md: 'var(--doran-radius-md)',
    lg: 'var(--doran-radius-lg)',
    full: 'var(--doran-radius-full)',
  },
  space: {
    xs: 'var(--doran-space-xs)',
    sm: 'var(--doran-space-sm)',
    md: 'var(--doran-space-md)',
    lg: 'var(--doran-space-lg)',
  },
  font: {
    sans: 'var(--doran-font-sans)',
  },
  shadow: {
    sm: 'var(--doran-shadow-sm)',
    md: 'var(--doran-shadow-md)',
  },
} as const;

/** Available color schemes. */
export type ThemeMode = 'light' | 'dark';

/** Text/layout direction. Doran is RTL-first. */
export type Direction = 'rtl' | 'ltr';
