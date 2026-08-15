# Upgrading to 0.5

Everything in the TypeScript API is additive — no export, prop, or callback signature
was removed, and controlled/uncontrolled behaviour is unchanged. **If you have not
written CSS against Doran's internals and your tests do not query the picker trigger,
you can upgrade without changes.**

What did change is the DOM, because the date picker's trigger became a real text
input. Two of the old class names are kept as aliases so most stylesheets keep
applying, but state selectors could not be preserved.

## The trigger is an input, not a button

```diff
- <button class="doran-datepicker__input">
-   <span class="doran-datepicker__value">۱۴۰۵/۰۳/۱۵</span>
-   <span class="doran-datepicker__icon">…</span>
- </button>
+ <div class="doran-datepicker__input">
+   <input class="doran-datepicker__control doran-datepicker__value" value="۱۴۰۵/۰۳/۱۵" />
+   <button class="doran-datepicker__icon">…</button>
+ </div>
```

`.doran-datepicker__input` still names the bordered field, and the input also carries
`.doran-datepicker__value`, so rules setting colour, font, or alignment keep working.

**In tests:**

```diff
- screen.getByRole('button', { name: /۱۴۰۵/ })
+ screen.getByRole('textbox')
```

The calendar icon is now its own button, named "باز کردن تقویم" (or "Open calendar"):

```diff
- fireEvent.click(screen.getByRole('button'))
+ fireEvent.click(screen.getByRole('button', { name: /تقویم/ }))
```

## State selectors moved

A `<div>` cannot match `:disabled`, and days are no longer natively disabled — they
use `aria-disabled` so they stay focusable and can announce why they are unavailable.

```diff
- .doran-datepicker__input:disabled       { … }
+ .doran-datepicker__input[data-disabled]  { … }

- .doran-datepicker__input:focus-visible  { … }
+ .doran-datepicker__input:focus-within    { … }

- .doran-day:disabled                     { … }
+ .doran-day[aria-disabled='true']         { … }
```

There is also a new `[data-invalid]` on the field when the typed text cannot be
parsed, styled through `--doran-input-invalid-border-color`.

## The time value is an input

```diff
- <span class="doran-time__value">۰۹</span>
+ <input class="doran-time__value" role="spinbutton" value="۰۹" />
```

Width is `--doran-time-field-width`, defaulting to `2.4ch`.

## Behaviour changes

- **The calendar no longer takes focus when it opens.** With a text trigger, grabbing
  focus would pull the caret out of the field mid-typing. Tab forward to reach the grid.
- **The pop-over no longer traps Tab.** It declares `aria-modal="false"`, which
  promises assistive technology the rest of the page is reachable; trapping broke that
  promise. Tabbing past either end closes it. Escape still closes and restores focus.
- **Arrow keys follow the locale's direction.** In an LTR locale `ArrowLeft` now goes
  back rather than forward.

## Opting out

`readOnly` keeps the field un-typable while leaving the calendar fully usable, if a
date must come from the grid:

```tsx
<DoranDatePicker readOnly />
```
