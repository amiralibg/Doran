---
'@doranjs/react': minor
'@doranjs/wc': minor
'@doranjs/angular': minor
---

Add a non-typable trigger, and fix picking a date on a phone

The trigger became a text field in the last release, which brought the on-screen
keyboard with it. `editable={false}` (`editable="false"` on `<doran-datepicker>`)
renders the trigger as a button instead: the whole field opens the calendar, a date
can only come from the grid, and no keyboard ever appears. It is not `readOnly`,
which keeps a real `<input>` and only refuses new text.

Picking a date on a phone could do nothing at all. The keyboard stayed up over the
calendar, and the first tap on a day dismissed it — which resized the viewport
mid-gesture, moved the pop-over out from under the finger, and left the browser
dispatching the resulting `click` at whatever had slid under the touch point. On a
coarse pointer the picker now gives up the caret as the calendar opens and does not
take focus back afterwards, so the keyboard is gone before the panel is placed.

`@doranjs/angular` gains a matching `editable` input. It maps attributes explicitly
rather than spreading them, so unlike Vue and Svelte the new one had to be declared;
it is not a boolean attribute, since the element reads `editable="false"` as a string.

Two supporting fixes, both of which stand on their own:

- The pop-over is measured against the visual viewport rather than
  `window.innerHeight`, which on iOS reports full height while the keyboard covers
  half the screen — so the calendar could be placed behind it. It also holds still
  for the length of any gesture that starts on it, instead of re-positioning between
  `pointerdown` and `pointerup`.
- The calendar icon was a 17px tap target, and on a typable field it is the only way
  to reach the calendar. It now grows to fill the field's height and
  `--doran-tap-target` wide (28px by default), taking the space from the text field
  rather than overlaying it, so tapping beside the icon still places the caret.
