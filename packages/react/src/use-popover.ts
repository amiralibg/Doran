'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { usePopoverPosition } from './use-popover-position';

export interface UsePopoverOptions {
  /** Match the pop-over's width to the trigger field. */
  matchTriggerWidth?: boolean;
  /** Called after the pop-over closes, so the caller can restore focus its own way. */
  onClose?: (restoreFocus: boolean) => void;
}

export interface PopoverState {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Closes the pop-over; `restoreFocus` asks the caller to take focus back. */
  close: (restoreFocus: boolean) => void;
  popoverId: string;
  rootRef: RefObject<HTMLDivElement>;
  fieldRef: RefObject<HTMLDivElement>;
  popoverRef: RefObject<HTMLDivElement>;
  position: ReturnType<typeof usePopoverPosition>;
  /** Attach to the pop-over: Tab past either end closes it rather than trapping. */
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * The pop-over shell shared by the date and range pickers: open state, outside-click
 * and Escape dismissal, positioning from the trigger field, and the non-modal Tab
 * behaviour.
 *
 * Both pickers had grown their own copy of this, which is how the two drifted on
 * whether the calendar steals focus and on what `matchTriggerWidth` measures.
 */
export function usePopover(options: UsePopoverOptions = {}): PopoverState {
  const { matchTriggerWidth = false, onClose } = options;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // The bordered field, not the root: a consumer's padding on the root would skew
  // a width match against what the user actually sees.
  const fieldRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  const position = usePopoverPosition(open, fieldRef, popoverRef, { matchTriggerWidth });

  function close(restoreFocus: boolean) {
    setOpen(false);
    onClose?.(restoreFocus);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      // The pop-over lives in a portal, so check both trees.
      if (!rootRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent | globalThis.KeyboardEvent) {
      if (event.key === 'Escape') close(true);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey as EventListener);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey as EventListener);
    };
    // Only `open` matters here: the handlers close over refs, which are stable.
  }, [open]);

  /**
   * Tabbing past either end closes the pop-over and moves on.
   *
   * It is `aria-modal="false"`, which promises assistive technology the rest of the
   * page is reachable; a focus trap broke that promise.
   */
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return;
    const focusable = popoverRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      // Backwards out of the pop-over lands on the trigger, where Tab began.
      event.preventDefault();
      close(true);
    } else if (!event.shiftKey && active === last) {
      // Forwards out continues into the page; let the browser pick the next stop.
      close(false);
    }
  }

  return { open, setOpen, close, popoverId, rootRef, fieldRef, popoverRef, position, onKeyDown };
}
