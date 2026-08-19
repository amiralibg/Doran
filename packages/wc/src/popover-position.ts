/**
 * Pop-over placement, mirroring `@doranjs/react`'s `use-popover-position`.
 * Panels are appended to `document.body` and positioned `fixed` from the
 * trigger rect, so `overflow: hidden/auto` ancestors can never clip them.
 */

/** The band of the layout viewport the user can actually see, in client coordinates. */
export interface PopoverViewport {
  width: number;
  height: number;
  /** Client-space offset of the visible band. Non-zero when an on-screen keyboard is up. */
  top?: number;
  left?: number;
}

/**
 * Positions the panel below the trigger, aligned to its end (right) edge for
 * RTL, flipping above when there is no room below and clamping to the viewport.
 */
export function computePopoverPosition(
  trigger: DOMRect,
  popover: { width: number; height: number },
  viewport: PopoverViewport,
  gap = 4,
  margin = 8,
): { top: number; left: number } {
  // The visible band, not the document: with a keyboard up these are offset.
  const viewTop = viewport.top ?? 0;
  const viewLeft = viewport.left ?? 0;
  const viewBottom = viewTop + viewport.height;
  const viewRight = viewLeft + viewport.width;

  let top = trigger.bottom + gap;
  const overflowsBelow = top + popover.height > viewBottom - margin;
  const fitsAbove = trigger.top - gap - popover.height >= viewTop + margin;
  if (overflowsBelow && fitsAbove) top = trigger.top - gap - popover.height;

  // RTL-first: align the panel's right edge with the trigger's right edge.
  let left = trigger.right - popover.width;
  left = Math.min(
    Math.max(left, viewLeft + margin),
    Math.max(viewRight - popover.width - margin, viewLeft + margin),
  );
  top = Math.min(
    Math.max(top, viewTop + margin),
    Math.max(viewBottom - popover.height - margin, viewTop + margin),
  );
  return { top, left };
}

/**
 * The area the user can actually see.
 *
 * `window.innerHeight` is the wrong ruler on a phone: iOS keeps it at full height
 * while an on-screen keyboard covers the bottom half, so measuring against it
 * places the calendar behind the keyboard. The visual viewport reports what is
 * really on screen, and its offset converts that back into the client coordinates
 * `position: fixed` uses.
 */
export function readViewport(): PopoverViewport {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  if (!vv) return { width: window.innerWidth, height: window.innerHeight };
  return { width: vv.width, height: vv.height, top: vv.offsetTop, left: vv.offsetLeft };
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
      readViewport(),
    );
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  };

  /**
   * Moving the panel between `pointerdown` and `pointerup` is what breaks picking a
   * date on a phone: the tap blurs the text field, dismissing the keyboard fires
   * `resize`, the panel jumps out from under the finger, and the browser never turns
   * that touch into a `click` on the day. While a finger is down *on the panel* the
   * user is aiming at something, so hold still and catch up on release. A pointer
   * held anywhere else is a page scroll, which must keep tracking.
   */
  let heldInside = false;
  let missedUpdate = false;

  const schedule = (): void => {
    if (heldInside) {
      missedUpdate = true;
      return;
    }
    update();
  };
  const onPointerDown = (event: PointerEvent): void => {
    heldInside = popover.contains(event.target as Node);
  };
  const onPointerRelease = (): void => {
    heldInside = false;
    if (missedUpdate) {
      missedUpdate = false;
      update();
    }
  };

  update();
  window.addEventListener('resize', schedule);
  // Capture-phase so scrolls inside any ancestor (cards, modals, …) retrigger.
  window.addEventListener('scroll', schedule, true);
  // Capture-phase again: the day button's own handler must not be able to pre-empt
  // the freeze by stopping propagation.
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('pointerup', onPointerRelease, true);
  document.addEventListener('pointercancel', onPointerRelease, true);
  // The on-screen keyboard moves the visual viewport without always resizing the
  // layout one, so `resize` alone can miss it entirely.
  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  vv?.addEventListener('resize', schedule);
  vv?.addEventListener('scroll', schedule);
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
  observer?.observe(popover);
  return () => {
    window.removeEventListener('resize', schedule);
    window.removeEventListener('scroll', schedule, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('pointerup', onPointerRelease, true);
    document.removeEventListener('pointercancel', onPointerRelease, true);
    vv?.removeEventListener('resize', schedule);
    vv?.removeEventListener('scroll', schedule);
    observer?.disconnect();
  };
}
