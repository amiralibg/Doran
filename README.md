<div align="center">

# Doran

### The Open Source Persian Calendar Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/amiralibg/Doran/actions/workflows/ci.yml/badge.svg)](https://github.com/amiralibg/Doran/actions/workflows/ci.yml)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

**[📖 Documentation](https://amiralibg.github.io/Doran/)** ·
**[🧭 Examples](https://amiralibg.github.io/Doran/examples)** ·
**[⚛️ React demo](https://amiralibg.github.io/Doran/examples/react/)** ·
**[🌐 Vanilla demo](https://amiralibg.github.io/Doran/examples/vanilla/)**

</div>

> **دوران** — A complete, accurate, and developer-friendly toolkit for the Solar Hijri
> (Persian / Jalali) calendar.

Doran is a TypeScript monorepo that provides everything you need to work with the Persian
calendar: a rock-solid date engine, natural-language parsing, holiday datasets, React
components, and a design system — all tree-shakeable, strongly typed, and immutable.

## Packages

| Package                                    | Description                                            | Status |
| ------------------------------------------ | ------------------------------------------------------ | ------ |
| [`@doranjs/core`](./packages/core)         | Immutable `DoranDate`, conversions, arithmetic, format | ✅     |
| [`@doranjs/nlp`](./packages/nlp)           | Persian natural-language date parsing                  | ✅     |
| [`@doranjs/holidays`](./packages/holidays) | Iranian official & religious holidays                  | ✅     |
| [`@doranjs/react`](./packages/react)       | RTL-first, accessible React calendar components        | ✅     |
| [`@doranjs/wc`](./packages/wc)             | Framework-agnostic Web Components for plain HTML       | ✅     |
| [`@doranjs/ui`](./packages/ui)             | Minimal, themeable design system                       | ✅     |

## Quick start

```bash
pnpm add @doranjs/core
```

```ts
import { DoranDate } from '@doranjs/core';

const today = DoranDate.now();

today.format('YYYY/MM/DD'); // ۱۴۰۵/۰۳/۱۱ → "1405/03/11"
today.addDays(10).format('dddd D MMMM YYYY');
today.toGregorian(); // native Date

DoranDate.fromGregorian(new Date());
```

Parse Persian dates from free text — including Finglish and keyboard-layout typos:

```ts
import { parse } from '@doranjs/nlp';

parse('جمعه ساعت ۷ شب'); // → { date, confidence, matched }
parse('بیست و یکم خرداد'); // compound number words
parse('اواخر اسفند'); // anchored months
parse('farda'); // Finglish → فردا
parse('tvnh'); // keyboard left in English → فردا
```

## Documentation

- **[Docs site](https://amiralibg.github.io/Doran/)** — bilingual (فارسی by default, with an
  English locale at [`/en/`](https://amiralibg.github.io/Doran/en/)).
- **[Getting started](https://amiralibg.github.io/Doran/en/guide/getting-started)** ·
  **[Architecture](https://amiralibg.github.io/Doran/en/guide/architecture)** ·
  **[API reference](https://amiralibg.github.io/Doran/en/api/core)**
- **[Examples & live demos](https://amiralibg.github.io/Doran/examples)** — runnable
  [React](https://amiralibg.github.io/Doran/examples/react/) and
  [Vanilla / Web Component](https://amiralibg.github.io/Doran/examples/vanilla/) playgrounds.

## Development

This repo uses [pnpm workspaces](https://pnpm.io/workspaces) and
[Turborepo](https://turbo.build/).

```bash
pnpm install        # install all workspace dependencies
pnpm build          # build every package
pnpm test           # run the full test suite
pnpm lint           # lint everything
pnpm typecheck      # type-check everything
pnpm dev            # watch mode across packages
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contributor guide.

## Architecture

Doran follows domain-driven package boundaries with strict dependency direction:

```
@doranjs/ui   @doranjs/react   @doranjs/wc ─┐
                                        ├──▶ @doranjs/core ◀── @doranjs/nlp
@doranjs/holidays ─────────────────────────┘
```

`@doranjs/core` has zero runtime dependencies and no knowledge of UI, locale data lives at
the edges, and every public type is exported. Read the full
[architecture guide](./apps/docs/guide/architecture.md).

## License

[MIT](./LICENSE) © Doran Contributors
