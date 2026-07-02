# Doran with SSR

Server-rendered apps render markup twice: once on the server, once on the client during hydration. If the two don't match **byte-for-byte**, the framework throws a hydration error and discards the server HTML. With dates there are two classic sources of mismatch:

1. **Digits / locale** — the server renders `۱۴۰۳` (Persian) but the client renders `1403` (Latin), or vice-versa, because the locale differed between the two environments.
2. **Time zone** — `DoranDate.now()` reads the _system_ time zone. A server in `UTC` and a browser in `Asia/Tehran` can land on different days, so "today" (and any default month derived from it) differs.

Doran is built to make both deterministic.

## The two rules

**1. Pin the locale — don't rely on the mutable global.**
`setDefaultLocale()` mutates a module-level singleton. On a server that handles many requests concurrently this is a footgun, and if the server and client disagree you get a digit mismatch. Instead, scope the locale with a **provider** (below) or pass `locale` explicitly.

**2. Pin "now" — never let the two environments each call `Date.now()` independently.**
Compute the reference instant once and pass it down, or freeze the clock. Options, cheapest first:

```ts
import { DoranDate, freeze } from '@doranjs/core';

// (a) Pass an explicit value/today prop so nothing derives from the ambient clock.
const today = DoranDate.now({ timeZone: 'Asia/Tehran' });

// (b) Or freeze the clock for the render (also great for tests).
freeze(DoranDate.fromGregorian(new Date('2026-07-02T00:00:00Z')));
```

Always pass an explicit `timeZone` when the instant matters, so the server and client agree regardless of where they run.

## The provider primitive

Every framework binding ships a `DoranProvider` that sets `locale` (and `timeZone`) for its subtree. It's **request-scoped**, not global, so it's safe under SSR — components resolve their locale as **explicit prop → provider → global default**.

::: code-group

```tsx [React / Next.js]
import { DoranProvider, DoranDatePicker } from '@doranjs/react';
import { faIR } from '@doranjs/core';

export default function Page() {
  return (
    <DoranProvider locale={faIR} timeZone="Asia/Tehran">
      <DoranDatePicker />
    </DoranProvider>
  );
}
```

```vue [Vue / Nuxt]
<script setup lang="ts">
import { DoranProvider, DoranDatePicker } from '@doranjs/vue';
</script>

<template>
  <DoranProvider locale="fa" timeZone="Asia/Tehran">
    <DoranDatePicker />
  </DoranProvider>
</template>
```

```svelte [Svelte / SvelteKit]
<script lang="ts">
  import { DoranProvider, DoranDatePicker } from '@doranjs/svelte';
</script>

<DoranProvider locale="fa" timeZone="Asia/Tehran">
  <DoranDatePicker />
</DoranProvider>
```

```ts [Angular / Universal]
import { Component } from '@angular/core';
import { DoranProvider, DoranDatePicker } from '@doranjs/angular';

@Component({
  standalone: true,
  imports: [DoranProvider, DoranDatePicker],
  template: `
    <dr-provider locale="fa" timeZone="Asia/Tehran">
      <dr-date-picker />
    </dr-provider>
  `,
})
export class AppComponent {}
```

:::

> React's `DoranProvider` takes a `Locale` object (`faIR` / `enUS`). The web-component-based bindings (Vue / Svelte / Angular) take the `locale` **attribute** string (`'fa'` / `'en'`), matching `@doranjs/wc`.

## Per-framework notes

### Next.js

The React components are client components (`'use client'`). Render `DoranProvider` in a client boundary and pass `locale`/`timeZone` from server config so both passes agree. Because Doran formats via the provider (not a mutable global), the digits are identical on server and client.

### Nuxt

`@doranjs/vue` wraps `@doranjs/wc`, which auto-registers the custom elements **client-side only** (it's SSR-guarded). The server emits the inert `<doran-*>` tag and the browser upgrades it on mount — no mismatch, because the tag name and the `locale` attribute the provider sets are the same in both passes. Add `doran-*` to `vue.compilerOptions.isCustomElement` if you also use the raw elements.

### SvelteKit

Same model: the custom elements load in `onMount`, so server output is the inert tag. Put `DoranProvider` in your root `+layout.svelte` and set `locale` from `event.locals`/config so every request renders deterministically.

### Angular Universal

`@doranjs/angular` ships partial-Ivy standalone components. The elements upgrade after `ngAfterViewInit` on the browser; the server renders the inert tag with the `locale` attribute from `dr-provider`. Provide `locale`/`timeZone` at the root so the whole app is consistent.

## Checklist

- [ ] Wrap your app (or subtree) in `DoranProvider` with an explicit `locale`.
- [ ] Pass an explicit `timeZone` anywhere the instant matters; for calendars with no value, pass a `value`/`today` computed once.
- [ ] Don't call `setDefaultLocale()` only on the client.
- [ ] For deterministic snapshots/tests, `freeze()` the clock.
