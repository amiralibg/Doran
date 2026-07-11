---
'@doranjs/react': minor
'@doranjs/wc': minor
'@doranjs/vue': minor
'@doranjs/svelte': minor
'@doranjs/angular': minor
---

Smarter pop-overs and customizable trigger icons.

**Pop-overs can no longer be clipped.** The date-picker calendar and the NLP-input
suggestions list are now rendered in a portal on `document.body` and positioned
`fixed` from the trigger rect, so they always appear on top of the page — even when
the picker sits inside a card, modal, or table cell with `overflow: hidden/auto`.
They stay glued to the trigger while scrolling, flip above when there is no room
below, clamp to the viewport, and sit at `z-index: var(--doran-z-popover, 9999)`.
This applies to every framework package (React natively; Vue, Svelte, and Angular
via the shared web components).

**The trigger icon is now yours.** React: `icon={<MyIcon />}` replaces the default
calendar icon and `icon={null}` hides it. Web components (and therefore Vue/Svelte/
Angular): add the `hide-icon` attribute to hide it, or pass a custom node as a
light-DOM child — `<doran-datepicker><svg slot="icon" …></doran-datepicker>`.
Angular additionally exposes a `hideIcon` input and projects children into the
element.
