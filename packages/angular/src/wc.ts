/**
 * `@doranjs/wc` auto-registers the custom elements on import (SSR-guarded). We
 * load it once on the client so the elements upgrade; on the server the dynamic
 * import is skipped and Angular just renders the inert tag until hydration.
 */
let wcLoaded: Promise<unknown> | null = null;

export function ensureElements(): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.resolve();
  wcLoaded ??= import('@doranjs/wc');
  return wcLoaded;
}

/** Read a CustomEvent's `detail`. */
export function detail<T>(e: Event): T {
  return (e as CustomEvent<T>).detail;
}
