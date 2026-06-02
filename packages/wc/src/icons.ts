/** Inline SVG chevrons/icons as strings, mirroring `@doranjs/ui`'s icon set. */

const svg = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" width="1em" height="1em">${paths}</svg>`;

export const chevronRight = svg('<path d="m9 18 6-6-6-6" />');
export const chevronLeft = svg('<path d="m15 18-6-6 6-6" />');
export const chevronUp = svg('<path d="m18 15-6-6-6 6" />');
export const chevronDown = svg('<path d="m6 9 6 6 6-6" />');
export const calendarIcon = svg(
  '<rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />',
);
