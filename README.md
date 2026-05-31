<div align="center">

# Doran

### The Open Source Persian Calendar Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/amiralibg/Doran/actions/workflows/ci.yml/badge.svg)](https://github.com/amiralibg/Doran/actions/workflows/ci.yml)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

</div>

> **دوران** — A complete, accurate, and developer-friendly toolkit for the Solar Hijri
> (Persian / Jalali) calendar.

Doran is a TypeScript monorepo that provides everything you need to work with the Persian
calendar: a rock-solid date engine, natural-language parsing, holiday datasets, React
components, and a design system — all tree-shakeable, strongly typed, and immutable.

## Packages

| Package                                  | Description                                            | Status |
| ---------------------------------------- | ------------------------------------------------------ | ------ |
| [`@doran/core`](./packages/core)         | Immutable `DoranDate`, conversions, arithmetic, format | ✅     |
| [`@doran/nlp`](./packages/nlp)           | Persian natural-language date parsing                  | ✅     |
| [`@doran/holidays`](./packages/holidays) | Iranian official & religious holidays                  | ✅     |
| [`@doran/react`](./packages/react)       | RTL-first, accessible React calendar components        | 🚧     |
| [`@doran/ui`](./packages/ui)             | Minimal, themeable design system                       | 🚧     |

## Quick start

```bash
pnpm add @doran/core
```

```ts
import { DoranDate } from '@doran/core';

const today = DoranDate.now();

today.format('YYYY/MM/DD'); // ۱۴۰۵/۰۳/۱۱ → "1405/03/11"
today.addDays(10).format('dddd D MMMM YYYY');
today.toGregorian(); // native Date

DoranDate.fromGregorian(new Date());
```

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
@doran/ui      @doran/react ─┐
                             ├──▶ @doran/core ◀── @doran/nlp
@doran/holidays ─────────────┘
```

`@doran/core` has zero runtime dependencies and no knowledge of UI, locale data lives at
the edges, and every public type is exported. Read the full
[architecture guide](./apps/docs/guide/architecture.md).

## License

[MIT](./LICENSE) © Doran Contributors
