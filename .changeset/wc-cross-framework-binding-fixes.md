---
'@doranjs/wc': patch
---

Fix cross-framework binding issues surfaced by the Vue/Svelte/Angular demos.

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
