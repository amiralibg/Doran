'use client';

import { useEffect, useState } from 'react';

/** How the calendar is presented over the page. */
export type PickerMode = 'popover' | 'sheet' | 'auto';

/** Below this viewport width, `auto` chooses the sheet. */
export const SHEET_BREAKPOINT = 640;

/**
 * Resolves `mode` into what should actually render.
 *
 * A 320px calendar anchored near the bottom of a phone viewport is a bad time: the
 * pop-over positioner can only flip and clamp, so it ends up squeezed against an
 * edge with the on-screen keyboard covering half of it. Under the breakpoint the
 * calendar becomes a bottom sheet instead.
 *
 * SSR-safe: renders as a pop-over on the server and corrects after hydration, since
 * viewport width is not knowable until then.
 */
export function usePresentation(mode: PickerMode = 'popover'): 'popover' | 'sheet' {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (mode !== 'auto' || typeof window === 'undefined' || !window.matchMedia) return;

    const query = window.matchMedia(`(max-width: ${SHEET_BREAKPOINT - 1}px)`);
    const sync = () => setIsNarrow(query.matches);
    sync();

    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [mode]);

  if (mode === 'sheet') return 'sheet';
  if (mode === 'popover') return 'popover';
  return isNarrow ? 'sheet' : 'popover';
}

/**
 * Whether the primary pointer is a finger — i.e. focusing a text field raises an
 * on-screen keyboard.
 *
 * The picker uses this to give up the caret when the calendar opens. A keyboard
 * covering the lower half of the screen is bad enough on its own; worse is that
 * the first tap on a day dismisses it, which resizes the viewport mid-gesture,
 * moves the panel out from under the finger, and loses the tap entirely.
 */
export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}
