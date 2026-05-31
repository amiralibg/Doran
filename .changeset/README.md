# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

When you make a change to any package that should be released, run:

```bash
pnpm changeset
```

Select the affected packages, choose a semver bump (patch / minor / major), and write a
short, user-facing summary. Commit the generated markdown file alongside your change.

Release automation consumes these files to version packages and generate changelogs.
See [the documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
for the full workflow.
