'use client';

import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

/**
 * Pure placement math shared by the pop-over components (mirrored in
 * `@doranjs/wc`). Positions the panel *fixed* below the trigger, aligned to its
 * end (right) edge for RTL, flipping above when there is no room below and
 * clamping to the viewport so it can never be clipped by an
 * `overflow: hidden/auto` ancestor.
 */
export function computePopoverPosition(
  trigger: DOMRect,
  popover: { width: number; height: number },
  viewport: { width: number; height: number },
  gap = 4,
  margin = 8,
): { top: number; left: number } {
  let top = trigger.bottom + gap;
  const overflowsBelow = top + popover.height > viewport.height - margin;
  const fitsAbove = trigger.top - gap - popover.height >= margin;
  if (overflowsBelow && fitsAbove) top = trigger.top - gap - popover.height;

  // RTL-first: align the panel's right edge with the trigger's right edge.
  let left = trigger.right - popover.width;
  left = Math.min(
    Math.max(left, margin),
    Math.max(viewport.width - popover.width - margin, margin),
  );
  top = Math.min(
    Math.max(top, margin),
    Math.max(viewport.height - popover.height - margin, margin),
  );
  return { top, left };
}

/**
 * Keeps a portaled pop-over glued to its trigger with `position: fixed`.
 * Recomputes on open, scroll (any ancestor), resize, and panel size changes.
 * Returns `null` until the first measurement so callers can hide the panel
 * for that single frame (`useLayoutEffect` runs before paint, so in practice
 * there is no visible flash).
 */
export function usePopoverPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  options?: { matchTriggerWidth?: boolean },
): CSSProperties | null {
  const matchTriggerWidth = options?.matchTriggerWidth ?? false;
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return;
    }

    function update() {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      if (!trigger || !popover) return;
      const rect = trigger.getBoundingClientRect();
      const width = matchTriggerWidth ? rect.width : popover.offsetWidth;
      const { top, left } = computePopoverPosition(
        rect,
        { width, height: popover.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
      );
      setStyle({
        position: 'fixed',
        top,
        left,
        ...(matchTriggerWidth ? { width } : {}),
      });
    }

    update();
    window.addEventListener('resize', update);
    // Capture-phase so scrolls inside any ancestor (cards, modals, …) retrigger.
    window.addEventListener('scroll', update, true);
    const observer =
      typeof ResizeObserver !== 'undefined' && popoverRef.current
        ? new ResizeObserver(update)
        : null;
    if (observer && popoverRef.current) observer.observe(popoverRef.current);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer?.disconnect();
    };
  }, [open, matchTriggerWidth, triggerRef, popoverRef]);

  return style;
}
