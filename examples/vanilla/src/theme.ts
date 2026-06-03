type Theme = 'light' | 'dark';

let current: Theme = 'light';
const listeners = new Set<() => void>();

export function getTheme(): Theme {
  return current;
}

export function onThemeChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Toggle light/dark by flipping `data-doran-theme` on the page root. */
export function toggleTheme(): void {
  current = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-doran-theme', current);
  for (const fn of listeners) fn();
}
