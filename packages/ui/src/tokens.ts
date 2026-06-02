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
    surfaceRaised: 'var(--doran-surface-raised)',
    border: 'var(--doran-border)',
    borderStrong: 'var(--doran-border-strong)',
    text: 'var(--doran-text)',
    textMuted: 'var(--doran-text-muted)',
    textSubtle: 'var(--doran-text-subtle)',
    primary: 'var(--doran-primary)',
    primaryHover: 'var(--doran-primary-hover)',
    primarySoft: 'var(--doran-primary-soft)',
    primaryContrast: 'var(--doran-primary-contrast)',
    accent: 'var(--doran-accent)',
    accentSoft: 'var(--doran-accent-soft)',
    danger: 'var(--doran-danger)',
    success: 'var(--doran-success)',
    warning: 'var(--doran-warning)',
    holiday: 'var(--doran-holiday)',
    holidaySoft: 'var(--doran-holiday-soft)',
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
    weightNormal: 'var(--doran-font-weight-normal)',
    weightMedium: 'var(--doran-font-weight-medium)',
    weightSemibold: 'var(--doran-font-weight-semibold)',
    weightBold: 'var(--doran-font-weight-bold)',
  },
  shadow: {
    sm: 'var(--doran-shadow-sm)',
    md: 'var(--doran-shadow-md)',
    lg: 'var(--doran-shadow-lg)',
  },
} as const;

/** Available color schemes. */
export type ThemeMode = 'light' | 'dark';

/** Text/layout direction. Doran is RTL-first. */
export type Direction = 'rtl' | 'ltr';
