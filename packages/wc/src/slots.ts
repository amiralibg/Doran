/**
 * Light-DOM named slots.
 *
 * Doran's elements render with `innerHTML`, which wipes any children the author
 * wrote. Rather than move to shadow DOM, we capture `[slot="…"]` children once,
 * detach them, and re-insert them after every render — generalizing the trick
 * `<doran-datepicker>` already used for its custom icon.
 *
 * Because these are ordinary light-DOM children, Vue, Svelte, and Angular templates
 * can fill them with no wrapper support at all.
 */

/** Regions an element exposes to `[slot]` children. */
export type SlotName = 'legend' | 'aside' | 'footer';

/** The regions every calendar-like element accepts. */
export const CALENDAR_SLOTS: readonly SlotName[] = ['legend', 'aside', 'footer'];

/** CSS class the placeholder for each region carries. */
const SLOT_CLASS: Record<SlotName, string> = {
  legend: 'doran-calendar__legend',
  aside: 'doran-calendar__aside',
  footer: 'doran-calendar__footer-slot',
};

/**
 * Captures the author's `[slot]` children. Call once, before the first render —
 * afterwards the originals are gone from the DOM.
 */
export function captureSlots(
  host: Element,
  names: readonly SlotName[] = CALENDAR_SLOTS,
): Map<SlotName, Element> {
  const captured = new Map<SlotName, Element>();
  for (const name of names) {
    const node = host.querySelector(`:scope > [slot="${name}"]`);
    if (node) captured.set(name, node);
  }
  return captured;
}

/** Markup reserving a region, to be filled by {@link restoreSlots} after render. */
export function slotPlaceholder(slots: Map<SlotName, Element>, name: SlotName): string {
  if (!slots.has(name)) return '';
  return `<div class="${SLOT_CLASS[name]}" data-slot="${name}"></div>`;
}

/** Moves the captured children back into their placeholders. Call after each render. */
export function restoreSlots(host: Element, slots: Map<SlotName, Element>): void {
  for (const [name, node] of slots) {
    host.querySelector(`[data-slot="${name}"]`)?.appendChild(node);
  }
}
