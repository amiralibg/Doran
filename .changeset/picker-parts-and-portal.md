---
'@doranjs/react': minor
'@doranjs/wc': minor
'@doranjs/angular': minor
---

Add per-part class names, a portal target, and the typable trigger in web components.

**`classNames`** reaches the parts `className` on the root can't: `root`, `trigger`,
`input`, `icon`, `popover`, and `calendar`. The calendar inside the pop-over
previously received no class name at all, so it was unreachable by props — styling it
meant writing element-level CSS.

```tsx
<DoranDatePicker classNames={{ trigger: 'h-9', popover: 'shadow-xl' }} />
```

**`portalContainer`** moves the pop-over out of `document.body`. Pass the dialog's own
element when the picker lives inside a focus-trapping dialog (shadcn, Radix, Headless
UI) — a body-level pop-over sits outside the trap, so the trap pulls focus straight
back out of the calendar.

**`<doran-datepicker>` gets the same typable trigger** as React, along with a
`readonly` attribute and a `parseerror` event. The element re-renders through
`innerHTML`, which would have wiped the caret and selection on every keystroke, so the
trigger is now left alone whenever the field has focus and only the pop-over
re-renders. The Angular wrapper gains a matching `readOnly` input; Vue and Svelte
already pass the attribute through.
