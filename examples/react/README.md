# Doran — React example

An interactive **component catalog** for the React bindings, built with Vite. Every
`@doranjs/react` component is shown across its options and states, and each demo has a
one-click **“Show code”** panel revealing the exact source that produced it — so the
page doubles as a browsable visual doc.

```bash
pnpm install
pnpm --filter doran-example-react dev
```

Then open the printed local URL.

## What's inside

- **Live demos + source** — each card renders a real component and, on click, shows its
  verbatim source (imported via Vite `?raw`, so the code shown can never drift from the
  code that runs), syntax-highlighted with Shiki.
- **Sections** — `DoranCalendar`, `DoranDatePicker`, `DoranRangePicker`, `DoranAgenda`,
  `DoranNlpInput`, `DoranTimePicker`, and a Theming section, reachable from the side nav
  (which highlights the section you're viewing).
- **Language toggle** — switch the whole catalog and the components between Persian and
  English; text direction follows the language (RTL ⇄ LTR) automatically.
- **Theme toggle** — light/dark via `ThemeProvider`.

## Structure

```
src/
  App.tsx                  shell: side nav, header, language/theme toggles, scroll-spy
  i18n/                    FA/EN dictionary + language provider
  demo/                    DemoCard, CodePanel (Shiki), Section
  demos/<component>/       one self-contained file per variation (the “?raw” source)
  sections/                wires each component's demos into a Section
```

To add a demo: drop a new file in `demos/<component>/`, then add a `<DemoCard>` for it
in the matching `sections/*.tsx`, importing both the component and its `?raw` source.
