# @doranjs/wc

## 0.6.0

### Minor Changes

- [#59](https://github.com/amiralibg/Doran/pull/59) [`22261ef`](https://github.com/amiralibg/Doran/commit/22261effb5b24d7d2a9a25d8adb36e3365f8e582) Thanks [@amiralibg](https://github.com/amiralibg)! - Make the pickers work on a phone by default

  The mobile path had been an opt-in that nobody would find and that didn't look right
  when they did. Three things were actually broken:
  - **The bottom sheet had no `background`.** It computed to `rgba(0, 0, 0, 0)`, so the
    sheet was a transparent box with a stray shadow around a calendar that appeared to
    float mid-screen. It also lost to the anchored pop-over's `max-width: calc(100vw -
1rem)` on source order, so it never reached either edge.
  - **The backdrop was never written.** A comment described a pseudo-element that did
    not exist. The page behind the sheet was never dimmed.
  - **The stylesheet had no width media queries at all.** Nothing adapted to a narrow
    screen, so the range picker put two month grids and a preset sidebar into 374px and
    the digits collapsed into each other.

  `mode` now defaults to `auto` rather than `popover`, for `DoranDatePicker`,
  `DoranRangeDatePicker`, `<doran-datepicker>`, and `<doran-rangedatepicker>` alike —
  under 640px they present as a bottom sheet. A panel anchored to a field near the
  bottom of a phone can only flip and clamp, so it ends up squeezed against an edge; the
  range picker, the widest panel here, simply ran off the screen with no way to scroll
  it. Pass `mode="popover"` for the previous behaviour at every width.

  `DoranRangeDatePicker` had no sheet support in React at all and now takes `mode`, so
  it matches the single picker and the web components.

  The sheet is full-bleed, dims the page behind it, carries a grabber, respects the home
  indicator, and scrolls internally. Under the breakpoint days grow to a 44px touch
  target, the range picker's months stack instead of sitting side by side, and its
  presets become a horizontal strip of pills rather than a column stealing a third of
  the width. New theme hooks: `--doran-sheet-bg`, `--doran-sheet-backdrop`,
  `--doran-sheet-grabber-color`, `--doran-sheet-grabber-width`,
  `--doran-sheet-content-width`, and `--doran-day-size-touch`.

  Days size themselves to the cell and cap at the touch target rather than being fixed
  at it. A hard 2.75rem day is 308px of grid before any padding, which does not fit a
  375px phone once an inline calendar has a legend beside it — the grid stops shrinking
  and the page scrolls sideways. Filling the cell up to that cap gives a full 44px
  wherever there is room and degrades smoothly where there is not. Below 400px the
  sheet and calendar also hand their padding back to the grid.

  375px is the floor this library designs for. At that width both pickers get a full
  44px day with room around it and no horizontal overflow; narrower still degrades
  rather than breaking.

  Desktop is unchanged: above 640px both pickers still anchor to the trigger at their
  existing sizes.

## 0.5.0

### Minor Changes

- [#57](https://github.com/amiralibg/Doran/pull/57) [`ff4d608`](https://github.com/amiralibg/Doran/commit/ff4d608a3f62a03f08c5ebc844b9955872683f08) Thanks [@amiralibg](https://github.com/amiralibg)! - Add a non-typable trigger, and fix picking a date on a phone

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

## 0.4.0

### Minor Changes

- [#55](https://github.com/amiralibg/Doran/pull/55) [`e9e9e0e`](https://github.com/amiralibg/Doran/commit/e9e9e0e73e2700e5e7daed58878dd3212cea9f35) Thanks [@amiralibg](https://github.com/amiralibg)! - Date picker inputs now mask typed digits into the configured `format` as they are entered and parse typed text against that format.
  - `@doranjs/core` adds `applyFormatMask()` and `isMaskableFormat()` for flowing typed digits into a format pattern (`14020512` → `1402/05/12`). Fields advance the way a native date input does — a digit that cannot fit moves on, so `95` in `MM` is month `09` and day `5` — and a separator the user types closes its field early, keeping `1402-1-2` as month 1 / day 2 rather than month 12. Typed separators are normalized to the format's own, digits render in the locale's numerals, and backspace deletes through separators.
  - `DoranDatePicker` / `<doran-datepicker>` and `DoranRangeDatePicker` / `<doran-rangedatepicker>` apply the mask while typing and parse against the developer-supplied `format` (falling back to the common defaults), so a custom pattern like `MM-DD-YYYY` accepts `05-12-1402`-style input. Formats built from text tokens (`MMMM`, `dddd`) are left unmasked and settle on blur as before.

### Patch Changes

- Updated dependencies [[`e9e9e0e`](https://github.com/amiralibg/Doran/commit/e9e9e0e73e2700e5e7daed58878dd3212cea9f35)]:
  - @doranjs/core@0.3.0
  - @doranjs/holidays@0.1.1
  - @doranjs/nlp@0.1.6

## 0.3.0

### Minor Changes

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Add day widgets and calendar slots.

  Days can now carry your own content — a fare, a seat count, an availability badge —
  and the regions around the grid can be filled with your own components. Closes #52.

  **Per-day content.** React gets two render functions; every framework gets a
  serializable map that also works from plain HTML.

  ```tsx
  <DoranDatePicker
    dayContent={(day) => <Fare value={fares[dayKey(day)]} />}
    dayProps={(day, meta) => ({ 'data-cheapest': isCheapest(day) || undefined })}
  />
  ```

  ```js
  picker.dayData = { '1404-5-12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' } };
  ```

  `dayData` keys are Jalali `YYYY-M-D`, and zero-padded or Persian-digit forms resolve
  to the same day.

  **`disabledDates`.** Days could previously only be blocked by `min`/`max`. Blackout
  dates, booked nights, and sold-out departures are now expressible, with a
  `disabledReason` that becomes both a tooltip and part of the day's accessible name.

  **Slots.** `legend`, `aside`, and `footer` accept your own content — via a `slots`
  prop in React, and light-DOM `<div slot="…">` children everywhere else, which Vue,
  Svelte, and Angular templates fill natively. `useDoranCalendar()` gives that content
  the calendar's state and navigation, so a slot widget can drive the calendar rather
  than just decorate it.

  **Holidays in React.** `@doranjs/react/holidays` exports `useHolidays()` and
  `createHolidayHelpers()`, closing the gap where `@doranjs/wc` had Iranian holidays
  built in and React did not. It ships as a subpath, so the dataset only enters bundles
  that import it, and it indexes each year once instead of re-resolving per day.

  **Accessibility.** Unavailable days now use `aria-disabled` rather than the `disabled`
  attribute, so they stay focusable and can announce why they cannot be picked; arrow
  navigation skips `min`/`max` gaps but lands on individually blocked days. A polite
  live region announces the focused day, including when navigation crosses a month
  boundary and the grid re-renders.

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Make locales actually localize.

  `setDefaultLocale(enUS)` previously still produced a right-to-left widget whose
  pop-over announced «تقویم». Direction and every user-visible string were hardcoded,
  which is what `iconPosition` and `textAlign` were really working around.

  **`Locale` gains `direction`.** Components read it instead of hardcoding `dir`, so a
  Latin locale yields a genuinely left-to-right widget. Arrow-key navigation follows —
  `ArrowLeft` advances in RTL and goes back in LTR — and the default navigation chevrons
  flip to match. An explicit `dir` prop overrides, and a locale omitting `direction`
  still resolves to `'rtl'`, so nothing written before this field changes behaviour.

  **`CalendarLabels` grows from two fields to twenty-two**, covering everything the
  components render or announce: the input placeholder, the pop-over and open-calendar
  names, previous/next month, the month and year selectors, the time picker's fields and
  steppers, the range summary separator and presets, the natural-language placeholder
  and its unresolved state, and the separator joining a day's date to its annotation.

  Every field is optional and `resolveCalendarLabels` now _merges_ with the Persian
  defaults rather than replacing them, so a locale defining only `today` and `clear` —
  as every locale written before these fields existed does — still gets a complete set.

  **Range presets are localized.** `defaultRangePresets()` hardcoded Persian digits, so
  even a consumer supplying custom presets got `'۷ روز اخیر'` under an English locale. It
  now takes a locale and builds labels through `formatNumber`, with `lastDays` as a
  `{count}` template. Calling it with no argument uses the ambient default, so existing
  calls are unchanged.

  **Web components honour `setDefaultLocale` too.** `resolveLocaleAttr` fell back to a
  hardcoded `faIR` when the `locale` attribute was absent, so the global default never
  reached them. It now falls back to the default locale and consults the locale registry
  first, which also makes `registerLocale()` usable from plain HTML.

  New in `@doranjs/core`: `resolveDirection(locale)` and the `ResolvedCalendarLabels`
  type. New on the React components: a `dir` prop.

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Add per-part class names, a portal target, and the typable trigger in web components.

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

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Bring the range trigger to every framework.

  React gained `DoranRangeDatePicker` — a range picker with an input trigger — but web
  components only had the inline `<doran-rangepicker>`, so Vue, Svelte, Angular, and
  plain-HTML users had no way to get one.

  `<doran-rangedatepicker>` closes that: one trigger holding two fields, either typable
  or fillable from the grid, with the same ordering guarantee (an end before the start
  swaps them), the same `mode="sheet"` presentation, and the same `dayData`,
  `disabledDates`, and slot support. It is exposed as `DoranRangeDatePicker` from
  `@doranjs/vue` and `@doranjs/svelte`, and as `<dr-range-date-picker>` from
  `@doranjs/angular`.

  Also fixed: `DoranDatePicker` in `@doranjs/svelte` forwarded only its default slot, so
  `legend`, `aside`, and `footer` never reached the element the way they did on the
  calendar and range picker.

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Add a range trigger, fix the time picker's keyboard, and add a mobile sheet mode.

  **`DoranRangeDatePicker`** gives the range picker the trigger it never had: one
  bordered field holding two inputs, either typable or fillable from the grid, with the
  pop-over, positioning, and non-modal keyboard behaviour the single picker already had.
  Both ends are kept in order — a backwards range is a slip, not an instruction, so
  picking or typing an end before the start swaps them. Nothing checked that before.
  `startName`/`endName` emit hidden fields for native submission.

  **The time picker had no keyboard handler at all.** The only way to change the time was
  to Tab onto a chevron and press Enter, which made 00:00 → 23:45 a long afternoon. Each
  field is now a `spinbutton`: a tab stop answering to arrows, PageUp/PageDown, and
  Home/End. The chevrons drop out of the tab order, since three fields' worth would put
  six extra stops between the grid and the footer. `withSeconds` and `hourCycle={12}`
  come along with it, the latter finally using `Locale.meridiem`, which had sat unused.

  **`mode="sheet"`, or `"auto"` under 640px**, stops the calendar trying to anchor itself
  to a trigger near the bottom of a phone viewport, where flip-and-clamp positioning
  leaves it squeezed against an edge under the on-screen keyboard. The stylesheet
  previously contained exactly one media query, and it was `prefers-reduced-motion`.

  Also fixed: **`DoranRangePicker` never accepted `min`/`max`.** The props were being
  passed by callers and silently dropped, because a JSX spread skips excess-property
  checking.

  New labels on `CalendarLabels`: `second`, `meridiem`, `rangeStart`, `rangeEnd`. New
  React exports: `usePopover` and `usePresentation`, the shared pop-over shell the two
  pickers now both use rather than keeping separate copies that had drifted.

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Make the time picker typable, give every unit its own step, and fix day-widget layout.

  **Type the time.** Each field is a real input as well as a spinbutton: type `14`, or
  step with the arrows. Persian and Arabic numerals are accepted. Partial input is left
  alone — halfway to `15` the field reads `1`, and committing that would fight the user
  mid-keystroke.

  **Per-unit steps.** `hourStep`, `minuteStep`, and `secondStep` each default to `1`, so
  `minuteStep={15}` leaves the hour moving one at a time. In web components,
  `hour-step` and `minute-step`.

  **Layout fixes for day widgets**, all visible with real content:
  - Day grids used `repeat(7, 1fr)`, and `1fr` floors at min-content — so one long
    annotation widened its column and pushed the whole grid out of alignment, spilling
    text into neighbouring days. Now `minmax(0, 1fr)`, which lets the column clip.
  - `slots.aside` squeezed the month grid instead of widening the calendar, because
    `.doran-calendar` is a fixed-width column. It now sizes to content when an aside is
    present, matching what the range picker already did for its presets.
  - Rich rows now share a `min-height`, so a row of annotated days is the same height as
    a row without them.
  - The legend and footer slots have real layout rather than sitting flush against the
    grid, and the holiday dot moves clear of the second line.

### Patch Changes

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Survive two installed copies of `@doranjs/core`.

  Published packages pinned `@doranjs/core` to an exact version, because pnpm rewrites
  `workspace:*` that way. When a consumer upgraded one Doran package without the others,
  their pins diverged and npm installed two copies — at which point
  `value instanceof DoranDate` returned `false` for a date built by the other copy, and
  `@doranjs/zod` silently rejected perfectly valid dates as unparseable.

  `DoranDate` now carries a `Symbol.for('doran.date')` brand. Registered symbols live in
  a global registry shared by every copy of a module, so the new `isDoranDate()` guard
  recognizes instances across copies where `instanceof` cannot. It replaces the
  cross-boundary `instanceof` checks in `@doranjs/zod` and in core's own `toDoranDate`.

  Internal `@doranjs/*` ranges also move from `workspace:*` to `workspace:^`, so they
  publish as caret ranges rather than exact pins. This is strictly a widening — existing
  lockfiles are untouched and new installs can only dedupe better.

  One limit worth knowing: below 1.0, `^0.2.0` does not admit `0.3.0`, so carets prevent
  duplicates only within a minor line. Fully solving cross-minor divergence needs a 1.0,
  where a caret spans every minor. The brand makes the remaining cases degrade gracefully
  rather than silently.

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Fix date-picker accessibility and fill in missing theme variables.

  **The pop-over no longer traps the keyboard.** It declares `aria-modal="false"`,
  promising assistive technology that the rest of the page stays reachable, but a focus
  trap meant Tab could never leave. Tabbing past either end now closes it and moves on;
  Shift+Tab returns to the trigger, and Escape still closes and restores focus.

  **The trigger has an accessible name.** It previously announced as just its digits —
  "۱۴۰۵/۰۳/۱۵, button" — with nothing saying it was a date field. It now announces the
  field and its value together, defaulting to the placeholder as the description, and
  accepting `aria-label` or `aria-labelledby` to override.

  **New theme variables**, so these no longer need element-level CSS to change:
  `--doran-input-font-size`, `--doran-input-shadow`, `--doran-input-focus-shadow`,
  `--doran-input-focus-border-color`, `--doran-placeholder-color`, `--doran-icon-color`,
  `--doran-icon-size`, `--doran-day-disabled-opacity`, and a full set of
  `--doran-time-*` variables for the time picker, which was previously styled almost
  entirely with literals. Every one falls back to the current value, so nothing changes
  visually unless you set them.

- Updated dependencies [[`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e)]:
  - @doranjs/holidays@0.1.0
  - @doranjs/core@0.2.0
  - @doranjs/nlp@0.1.5

## 0.2.4

### Patch Changes

- Updated dependencies [[`6335e77`](https://github.com/amiralibg/Doran/commit/6335e7728f1f5603e3a78b3d94d1821992e223e7)]:
  - @doranjs/core@0.1.3
  - @doranjs/holidays@0.0.8
  - @doranjs/nlp@0.1.4

## 0.2.3

### Patch Changes

- Updated dependencies [[`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d)]:
  - @doranjs/core@0.1.2
  - @doranjs/holidays@0.0.7
  - @doranjs/nlp@0.1.3

## 0.2.2

### Patch Changes

- [#46](https://github.com/amiralibg/Doran/pull/46) [`042946a`](https://github.com/amiralibg/Doran/commit/042946a1a544c847a6de9580f54ab34ef8c244bd) Thanks [@amiralibg](https://github.com/amiralibg)! - Isolate the date-picker trigger value from the surrounding RTL context with
  `dir="auto"` so digit-only formats like `YYYY-MM-DD HH:mm` no longer render
  time-before-date when `textAlign` is set without an explicit direction.

## 0.2.1

### Patch Changes

- [#44](https://github.com/amiralibg/Doran/pull/44) [`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302) Thanks [@amiralibg](https://github.com/amiralibg)! - Localize calendar footer actions such as Today and Clear from the active locale instead of always showing Persian labels.

- Updated dependencies [[`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302)]:
  - @doranjs/core@0.1.1
  - @doranjs/holidays@0.0.6
  - @doranjs/nlp@0.1.2

## 0.2.0

### Minor Changes

- [#42](https://github.com/amiralibg/Doran/pull/42) [`912981e`](https://github.com/amiralibg/Doran/commit/912981e93314414849fe2af80a90008596e8df61) Thanks [@amiralibg](https://github.com/amiralibg)! - Make date-picker footer actions configurable, make Today select the current date, and
  add nullable Clear events plus trigger alignment and input/dropdown width controls.

## 0.1.0

### Minor Changes

- [#40](https://github.com/amiralibg/Doran/pull/40) [`1321a2d`](https://github.com/amiralibg/Doran/commit/1321a2d5893ac3ff507041f0615a36242e772f83) Thanks [@amiralibg](https://github.com/amiralibg)! - Smarter pop-overs and customizable trigger icons.

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

## 0.0.10

### Patch Changes

- [#37](https://github.com/amiralibg/Doran/pull/37) [`415466c`](https://github.com/amiralibg/Doran/commit/415466cd17649fcc31d7fe3ced0bebc29e1231d8) Thanks [@amiralibg](https://github.com/amiralibg)! - Fix cross-framework binding issues surfaced by the Vue/Svelte/Angular demos.
  - **Range picker:** add a `value` setter (`{ start, end }`), so two-way bindings
    that assign the property (Vue `v-model`, Svelte `bind:value`, Angular
    `[formControl]`) work instead of throwing "Cannot set property value … which
    has only a getter".
  - **Range picker:** the `presets` property now tolerates a boolean. A bare
    `presets` attribute forwarded as a property (e.g. Svelte) arrives as `true`;
    it's treated as "show the defaults" rather than being iterated as a custom
    list (which produced `Invalid Jalali date: 0/0/1`).
  - **Range picker:** the `value`/`presets` setters no longer render before the
    element has initialized its view state — frameworks that set properties before
    the element connects no longer trigger a render against an empty (0/0/1) month.
  - **All components:** the `change`, `resolve`, `selectday`, and `input`
    CustomEvents no longer bubble. They collided with same-named framework outputs
    and native DOM events (e.g. Angular's `(resolve)` received the raw DOM event
    instead of the parsed result). Listen for them on the element directly, as all
    bindings and the vanilla example already do.

## 0.0.9

### Patch Changes

- Updated dependencies [[`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6), [`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6)]:
  - @doranjs/core@0.1.0
  - @doranjs/holidays@0.0.5
  - @doranjs/nlp@0.1.1

## 0.0.8

### Patch Changes

- [#14](https://github.com/amiralibg/Doran/pull/14) [`b125d4b`](https://github.com/amiralibg/Doran/commit/b125d4bfc24c6cb980cefab8669c9e55452649fd) Thanks [@amiralibg](https://github.com/amiralibg)! - Broaden natural-language date parsing to cover more ways users phrase dates:
  - Compound number-word days and counts (`بیست و یکم خرداد`), plus number words up to the
    hundreds (`صد و بیست و سه`).
  - More relative days: `امشب`, `دیشب`, `پریشب`.
  - Anchored named months (`اول فروردین`, `اوایل خرداد`, `اواخر اسفند`) and the
    `اوایل/اواسط/اواخر` anchors.
  - Weekday + week shift (`جمعه هفته بعد`, `شنبه هفته گذشته`) resolved to the correct week.
  - Relative-year qualifiers fold into an explicit date that omits its own year, so
    `۳ سال دیگه ۱۱ دی` resolves to 11 Dey of the +3 year (not the current year).
  - Tolerance for the colloquial ezafe «ی» in unit phrases (`هفته‌ی بعد`).
  - Extra parts of day: `نیمروز`, `سحر`, `شامگاه`.
  - `parseRange` now accepts the `(ما)بین X و Y` form; `parseRecurrence` understands
    `یک روز در میان` (every other day) and `هر <part-of-day>` (e.g. `هر شب`).
  - More Finglish aliases (`emshab`, `dishab`, spaced compound weekdays like `panj shanbe`,
    recurrence adverbs).

  The `DoranNlpInput` / `<doran-nlp-input>` resolved-date preview now shows the year when it
  differs from the current year, so dates that resolve to another year are no longer ambiguous.

- Updated dependencies [[`b125d4b`](https://github.com/amiralibg/Doran/commit/b125d4bfc24c6cb980cefab8669c9e55452649fd)]:
  - @doranjs/nlp@0.1.0

## 0.0.7

### Patch Changes

- [#12](https://github.com/amiralibg/Doran/pull/12) [`61081b7`](https://github.com/amiralibg/Doran/commit/61081b70894f1b15830e87cd28ab8958803ca080) Thanks [@amiralibg](https://github.com/amiralibg)! - Migrate the build toolchain from `tsup` (no longer maintained) to
  [`tsdown`](https://tsdown.dev) (rolldown-based). The published output is
  equivalent: same `.js`/`.cjs` + `.d.ts`/`.d.cts` entry points and sourcemaps, the
  React and Web Component stylesheets ship unchanged, and `@doranjs/wc` still emits its
  self-registering `dist/doran.global.js` IIFE bundle for CDN use. No API or runtime
  behavior changes.
- Updated dependencies [[`61081b7`](https://github.com/amiralibg/Doran/commit/61081b70894f1b15830e87cd28ab8958803ca080)]:
  - @doranjs/core@0.0.4
  - @doranjs/nlp@0.0.4
  - @doranjs/holidays@0.0.4

## 0.0.6

### Patch Changes

- [#10](https://github.com/amiralibg/Doran/pull/10) [`3a2d815`](https://github.com/amiralibg/Doran/commit/3a2d815e160cc206d3210ccba97896a2dc043b8b) Thanks [@amiralibg](https://github.com/amiralibg)! - Promote `@doranjs/react`, `@doranjs/wc`, and `@doranjs/ui` to stable. Each now ships a
  full DOM-level test suite (rendering, interaction, keyboard a11y, and event contracts)
  under `jsdom`, covering the calendar, date picker, range picker, time picker,
  natural-language input, and agenda components/elements, the `useCalendar`/`useDateRange`
  hooks, and the `Button`/`ThemeProvider` primitives. No runtime behavior changes.

## 0.0.5

### Patch Changes

- [#8](https://github.com/amiralibg/Doran/pull/8) [`b8a564a`](https://github.com/amiralibg/Doran/commit/b8a564a8c5c479c5b676434207650ebae84dbafb) Thanks [@amiralibg](https://github.com/amiralibg)! - Center the range picker's calendar within its body (`justify-content: center` on
  `.doran-rangepicker__body`), so a single-month picker no longer sits against the
  inline-start edge when the picker is wider than the calendar. The `@doranjs/wc`
  stylesheet, which bundles the React styles, ships the same fix.

## 0.0.4

### Patch Changes

- [#6](https://github.com/amiralibg/Doran/pull/6) [`5ae247a`](https://github.com/amiralibg/Doran/commit/5ae247a58476585a2a9aa8062780ad8aac3d3805) Thanks [@amiralibg](https://github.com/amiralibg)! - Working-day arithmetic, natural-language ranges/durations/recurrence, and range-picker
  presets + multi-month views.
  - `@doranjs/core` — a pure, weekend-aware working-day engine: `isWeekend`, `isWorkingDay`,
    `addWorkingDays`, `nextWorkingDay`, `previousWorkingDay`, and `workingDaysBetween`.
    Each accepts `WorkingDayOptions` with a custom `weekends` set and an optional injected
    `holidays` predicate, so core stays dependency-free.
  - `@doranjs/holidays` — holiday-aware wrappers of the above (`isWorkingDay`,
    `addWorkingDays`, `nextWorkingDay`, `previousWorkingDay`, `workingDaysBetween`) that
    default the `holidays` predicate to the package's official-holiday `isHoliday`.
  - `@doranjs/nlp` — `parseRange` («از ۵ تا ۱۰ فروردین»), `parseDuration` («یک ساعت و
    نیم»), and `parseRecurrence` («هر دوشنبه», «هر دو هفته») plus an `occurrences` helper
    that expands a recurrence into concrete dates.
  - `@doranjs/react` & `@doranjs/wc` — `DoranRangePicker` / `<doran-rangepicker>` gain
    quick-pick `presets` (defaults: last 7/30 days, this month, this year) and a
    side-by-side multi-month view (`numberOfMonths` / `months`). The React `useDateRange`
    hook exposes a new `setRange`, and `defaultRangePresets` is exported from both packages.

- Updated dependencies [[`5ae247a`](https://github.com/amiralibg/Doran/commit/5ae247a58476585a2a9aa8062780ad8aac3d3805)]:
  - @doranjs/core@0.0.3
  - @doranjs/holidays@0.0.3
  - @doranjs/nlp@0.0.3

## 0.0.3

### Patch Changes

- [#4](https://github.com/amiralibg/Doran/pull/4) [`b0a530e`](https://github.com/amiralibg/Doran/commit/b0a530e5a01f54bfcb233599450e4350ee2037f1) Thanks [@amiralibg](https://github.com/amiralibg)! - Accessibility: full WAI-ARIA keyboard navigation for the calendar grid.
  - Arrow keys move by day/week (RTL-aware), Home/End jump to the Saturday/Friday week
    edges, and **PageUp/PageDown** move by month (hold **Shift** for years). Arrowing or
    paging past the edge of the visible month now crosses month boundaries instead of
    stopping, with focus following the new month.
  - `@doranjs/react` — `DoranMonthView` tracks focus by date (roving tabindex), exposes an
    `onMonthChange` callback for cross-month focus, and labels the grid with the visible
    month/year (`aria-label`); range grids are marked `aria-multiselectable`. The new pure
    `navigateFocus(date, move)` helper is exported.
  - `@doranjs/wc` — `<doran-calendar>` and `<doran-rangepicker>` gain the same keyboard
    model (previously mouse-only) with roving tabindex and a labelled grid; range grids are
    marked `aria-multiselectable` with `aria-selected` cells. `navigateFocus` is exported.
  - Date-picker popovers (`DoranDatePicker` and `<doran-datepicker>`) now move focus into
    the calendar on open, restore it to the trigger on close/Escape, and trap Tab within
    the dialog.
  - `<doran-nlp-input>` links its combobox to the suggestion listbox via `aria-controls`,
    matching the React `DoranNlpInput`.

  New component for full React parity:
  - `@doranjs/wc` — adds `<doran-agenda>` (the `DoranAgenda` equivalent): a vertical,
    RTL-first day-by-day event list. Set `start`/`days`/`locale` plus an `events` array
    (and optional `renderEvent` formatter) as properties; clicking a day emits a
    `selectday` event. With this, every React component now has a Web Component counterpart.

## 0.0.2

### Patch Changes

- [#2](https://github.com/amiralibg/Doran/pull/2) [`774382b`](https://github.com/amiralibg/Doran/commit/774382b1ddb0261d0fe101ed87abadc2a2b88a53) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of `@doranjs/wc` — framework-agnostic Web Components for the Persian
  (Jalali) calendar. Registers `<doran-calendar>`, `<doran-datepicker>`,
  `<doran-rangepicker>`, and `<doran-nlp-input>` custom elements (built on the headless
  core, `@doranjs/nlp`, and `@doranjs/holidays`), usable in plain HTML or any framework.
  Ships a combined stylesheet and a self-registering CDN (IIFE) build.
- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d), [`4362f94`](https://github.com/amiralibg/Doran/commit/4362f945148e1618b4b432c1e52d04be94146587), [`015c983`](https://github.com/amiralibg/Doran/commit/015c9834c1d7235c88f8a6318dcfcbf64a79c08c)]:
  - @doranjs/core@0.0.2
  - @doranjs/nlp@0.0.2
  - @doranjs/holidays@0.0.2
