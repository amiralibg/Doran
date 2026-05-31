# Contributing to Doran

First off — thank you for taking the time to contribute! Doran aims to be the standard
open-source Persian calendar ecosystem, and that is only possible with community help.

## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold it.

## Getting started

1. **Fork & clone** the repository.
2. Make sure you are on **Node.js ≥ 20** and have **pnpm** installed (`corepack enable`).
3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Build and test to confirm a clean baseline:

   ```bash
   pnpm build && pnpm test
   ```

## Monorepo layout

```
packages/   publishable libraries (@doranjs/*)
apps/       the documentation site
examples/   reference integrations (react, nextjs, tauri)
playground/ local experiments
```

Each package builds with [tsup](https://tsup.egoist.dev/) and tests with
[Vitest](https://vitest.dev/). Turborepo orchestrates tasks across the workspace.

## Development workflow

```bash
pnpm dev                       # watch all packages
pnpm --filter @doranjs/core test # run one package's tests
pnpm --filter @doranjs/core test:watch
pnpm lint && pnpm typecheck    # before pushing
```

## Calendar correctness

Calendar accuracy is the single most important property of this project. Any change to
conversion, leap-year, or arithmetic logic **must** ship with tests covering:

- known reference dates (e.g. Nowruz boundaries),
- leap-year edge cases,
- round-trip conversions (`gregorian → jalali → gregorian`).

If you find a date that converts incorrectly, a failing test is the most valuable bug
report you can give us.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are
linted by commitlint. The format is:

```
<type>(<scope>): <subject>
```

- **types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
  `chore`, `revert`
- **scopes**: `core`, `nlp`, `holidays`, `react`, `ui`, `docs`, `playground`, `repo`,
  `deps`, `ci`

Examples:

```
feat(core): add ISO week-of-year calculation
fix(nlp): handle "پس فردا" with trailing whitespace
docs: clarify timezone behaviour in getting started
```

## Changesets

If your change affects a published package, add a changeset:

```bash
pnpm changeset
```

Pick the affected packages, choose the semver bump, and describe the change for end users.
Commit the generated file with your PR. PRs that change package behaviour without a
changeset will be flagged in review.

## Pull requests

1. Create a topic branch from `main`.
2. Keep PRs focused; one logical change per PR.
3. Ensure `pnpm lint`, `pnpm typecheck`, and `pnpm test` all pass.
4. Fill out the PR template, including a changeset when relevant.
5. A maintainer will review — please be responsive to feedback.

## Reporting bugs & requesting features

Use the [issue templates](https://github.com/amiralibg/Doran/issues/new/choose). For
security issues, follow [SECURITY.md](./SECURITY.md) instead of opening a public issue.

Happy hacking! 🌖
