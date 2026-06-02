---
layout: home

hero:
  name: Doran
  text: The Open Source Persian Calendar Ecosystem
  tagline: A complete, accurate, and developer-friendly toolkit for the Solar Hijri (Jalali) calendar.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/amiralibg/Doran

features:
  - icon: 📅
    title: Accurate by design
    details: Conversion uses the battle-tested Borkowski/jalaali algorithm, validated by an exhaustive day-by-day round-trip test suite.
  - icon: 🧩
    title: Immutable & typed
    details: An immutable DoranDate, strong types everywhere, and tree-shakeable builds with zero runtime dependencies in the core.
  - icon: 🗣️
    title: Forgiving Persian NLP
    details: Parse «فردا» or «جمعه ساعت ۷ شب» — plus Finglish («farda») and even text typed with the keyboard left in English — with a confidence score.
  - icon: 🎉
    title: Holidays included
    details: Iranian national, religious, and cultural holidays — with custom holiday registration.
  - icon: ⚛️
    title: RTL-first React
    details: Accessible, keyboard-navigable, dark-mode-aware calendar components, built on headless primitives.
  - icon: 🌐
    title: Works anywhere
    details: Framework-agnostic Web Components drop into plain HTML, Vue, Svelte, or any framework — no build step required.
  - icon: 🎨
    title: Elegant, themeable UI
    details: A minimal design system where every part — colors, fonts, shadows, borders, radii, arrows — is a CSS variable you can override.
---

## Quick start

```bash
pnpm add @doranjs/core
```

```ts
import { DoranDate } from '@doranjs/core';

const today = DoranDate.now();

today.format('YYYY/MM/DD'); // "۱۴۰۵/۰۳/۱۱"
today.addDays(10).format('dddd D MMMM YYYY');
today.toGregorian(); // native Date

DoranDate.fromGregorian(new Date());
```
