# @doranjs/angular

## 0.6.2

### Patch Changes

- Updated dependencies [[`ed02eb5`](https://github.com/amiralibg/Doran/commit/ed02eb56f518dedc77e55377e9e6b9055da6d398), [`ed02eb5`](https://github.com/amiralibg/Doran/commit/ed02eb56f518dedc77e55377e9e6b9055da6d398)]:
  - @doranjs/wc@0.7.0

## 0.6.1

### Patch Changes

- Updated dependencies [[`22261ef`](https://github.com/amiralibg/Doran/commit/22261effb5b24d7d2a9a25d8adb36e3365f8e582)]:
  - @doranjs/wc@0.6.0

## 0.6.0

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

### Patch Changes

- Updated dependencies [[`ff4d608`](https://github.com/amiralibg/Doran/commit/ff4d608a3f62a03f08c5ebc844b9955872683f08)]:
  - @doranjs/wc@0.5.0

## 0.5.1

### Patch Changes

- Updated dependencies [[`e9e9e0e`](https://github.com/amiralibg/Doran/commit/e9e9e0e73e2700e5e7daed58878dd3212cea9f35)]:
  - @doranjs/core@0.3.0
  - @doranjs/wc@0.4.0

## 0.5.0

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

- Updated dependencies [[`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e)]:
  - @doranjs/core@0.2.0
  - @doranjs/wc@0.3.0

## 0.4.4

### Patch Changes

- Updated dependencies [[`6335e77`](https://github.com/amiralibg/Doran/commit/6335e7728f1f5603e3a78b3d94d1821992e223e7)]:
  - @doranjs/core@0.1.3
  - @doranjs/wc@0.2.4

## 0.4.3

### Patch Changes

- Updated dependencies [[`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d)]:
  - @doranjs/core@0.1.2
  - @doranjs/wc@0.2.3

## 0.4.2

### Patch Changes

- Updated dependencies [[`042946a`](https://github.com/amiralibg/Doran/commit/042946a1a544c847a6de9580f54ab34ef8c244bd)]:
  - @doranjs/wc@0.2.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302)]:
  - @doranjs/core@0.1.1
  - @doranjs/wc@0.2.1

## 0.4.0

### Minor Changes

- [#42](https://github.com/amiralibg/Doran/pull/42) [`912981e`](https://github.com/amiralibg/Doran/commit/912981e93314414849fe2af80a90008596e8df61) Thanks [@amiralibg](https://github.com/amiralibg)! - Make date-picker footer actions configurable, make Today select the current date, and
  add nullable Clear events plus trigger alignment and input/dropdown width controls.

### Patch Changes

- Updated dependencies [[`912981e`](https://github.com/amiralibg/Doran/commit/912981e93314414849fe2af80a90008596e8df61)]:
  - @doranjs/wc@0.2.0

## 0.3.0

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

### Patch Changes

- Updated dependencies [[`1321a2d`](https://github.com/amiralibg/Doran/commit/1321a2d5893ac3ff507041f0615a36242e772f83)]:
  - @doranjs/wc@0.1.0

## 0.2.0

### Minor Changes

- [#37](https://github.com/amiralibg/Doran/pull/37) [`c51a742`](https://github.com/amiralibg/Doran/commit/c51a742d375dcf6638da01f34f5c01c962dcb048) Thanks [@amiralibg](https://github.com/amiralibg)! - Make the Angular components work client-side and reach feature parity with the
  other bindings.
  - **Fix:** element properties (`value`, agenda `events`) were assigned in
    `ngAfterViewInit` — before the lazy `@doranjs/wc` import upgrades the element —
    so the assignment created an expando that shadowed the element's setter and
    never rendered. Every component now applies its value after the element upgrades
    (`ensureElements().then(...)`), gated by a `ready` flag.
  - **Fix:** `locale` now re-applies on change (via `ngOnChanges`), so switching
    locale at runtime updates the calendar.
  - **New inputs** forwarding the underlying element's options:
    `dr-calendar` — `headerMode`, `withTime`, `showHolidays`, `weekends`,
    `hideFooter`, `yearSpan`; `dr-date-picker` — `placeholder`, `format`,
    `withTime`; `dr-range-picker` — `headerMode`, `showHolidays`, `weekends`,
    `presets`, `months`, `yearSpan`; `dr-nlp-input` — `placeholder`; `dr-agenda` —
    `start`, `days`, `renderEvent` (previously only `events`/`locale`).

### Patch Changes

- [#37](https://github.com/amiralibg/Doran/pull/37) [`3ffaa11`](https://github.com/amiralibg/Doran/commit/3ffaa113a1d75a271bf2d6acaae2acd6c0f6b10a) Thanks [@amiralibg](https://github.com/amiralibg)! - Build in full Ivy compilation mode instead of partial. Partial (`ngDeclare`)
  output needs the Angular linker at build time; bundlers that don't run it (e.g.
  Vite via `@analogjs/vite-plugin-angular`, which skips `node_modules`) left the
  components unlinked, so consuming apps died at runtime with "JIT compiler
  unavailable". The peer dependency is pinned to a single Angular major, where
  full-compiled output is stable.
- Updated dependencies [[`415466c`](https://github.com/amiralibg/Doran/commit/415466cd17649fcc31d7fe3ced0bebc29e1231d8)]:
  - @doranjs/wc@0.0.10

## 0.1.0

### Minor Changes

- [#34](https://github.com/amiralibg/Doran/pull/34) [`d0a7f20`](https://github.com/amiralibg/Doran/commit/d0a7f2000d82df9167b8d4cce9d16572e79cd5ed) Thanks [@amiralibg](https://github.com/amiralibg)! - **New package `@doranjs/angular`** — idiomatic Angular bindings, completing the framework trio of [#22](https://github.com/amiralibg/Doran/issues/22).
  - Standalone components over the `@doranjs/wc` engine (no per-framework grid logic): `DoranDatePicker`, `DoranCalendar`, `DoranRangePicker`, `DoranNlpInput`, `DoranAgenda`.
  - Implement `ControlValueAccessor`, so they drop into reactive and template-driven forms.
  - Same change convention as `@doranjs/react` / `@doranjs/vue` / `@doranjs/svelte`: the form value is a `DoranDate`, `(change)` also reports the Gregorian `Date` (range picker reports `{ start, end }`).
  - Headless `createCalendarGrid()` built on Angular signals, reusing the shared `buildMonthGrid` / `navigateFocus`.
  - Works with Angular 19 and 20; SSR-safe (elements load client-side on init). Ships partial-Ivy output via `ngc`.

- [#34](https://github.com/amiralibg/Doran/pull/34) [`9377be6`](https://github.com/amiralibg/Doran/commit/9377be60be96c2525f9a897f8504fbe932cc122f) Thanks [@amiralibg](https://github.com/amiralibg)! - **SSR-safe `DoranProvider` for every framework binding** ([#26](https://github.com/amiralibg/Doran/issues/26)).

  Locale (Persian vs Latin digits) and time zone can differ between server and client, causing hydration mismatches. Each binding now ships a request-scoped provider that sets subtree defaults without touching the mutable global `setDefaultLocale()`:
  - `DoranProvider` for React (Context), Vue (`provide`/`inject`), Svelte (context), and Angular (`dr-provider`, DI token `DORAN_DEFAULTS`).
  - Components resolve their locale as **explicit prop → provider → global default**; React takes a `Locale` object, the wc-based bindings take the `locale` attribute string (`'fa'`/`'en'`).
  - New **"Doran with SSR"** guide covering hydration pitfalls across Next.js, Nuxt, SvelteKit, and Angular Universal.
