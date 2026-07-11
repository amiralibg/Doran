/**
 * Pop-over placement, mirroring `@doranjs/react`'s `use-popover-position`.
 * Panels are appended to `document.body` and positioned `fixed` from the
 * trigger rect, so `overflow: hidden/auto` ancestors can never clip them.
 */

/**
 * Positions the panel below the trigger, aligned to its end (right) edge for
 * RTL, flipping above when there is no room below and clamping to the viewport.
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
 * Glues `popover` (already `position: fixed` and in the DOM) to `trigger`:
 * positions it now and re-positions on any scroll, resize, or panel size
 * change. Returns a cleanup function that removes the listeners.
 */
export function trackPopoverPosition(
  trigger: HTMLElement,
  popover: HTMLElement,
  options?: { matchTriggerWidth?: boolean },
): () => void {
  const update = (): void => {
    const rect = trigger.getBoundingClientRect();
    if (options?.matchTriggerWidth) popover.style.width = `${rect.width}px`;
    const { top, left } = computePopoverPosition(
      rect,
      { width: popover.offsetWidth, height: popover.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
    );
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  };

  update();
  window.addEventListener('resize', update);
  // Capture-phase so scrolls inside any ancestor (cards, modals, …) retrigger.
  window.addEventListener('scroll', update, true);
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
  observer?.observe(popover);
  return () => {
    window.removeEventListener('resize', update);
    window.removeEventListener('scroll', update, true);
    observer?.disconnect();
  };
}
