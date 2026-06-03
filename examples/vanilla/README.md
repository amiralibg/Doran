# Doran — Web Components example

An interactive **component catalog** for the framework-agnostic
[`@doranjs/wc`](../../packages/wc) custom elements, built with Vite — no framework
required. Every element is shown across its options and states, and each demo has a
one-click **“Show code”** panel revealing the exact source that produced it, so the page
doubles as a browsable visual doc.

```bash
pnpm install
pnpm --filter doran-example-vanilla dev
```

Then open the printed local URL.

## What's inside

- **Live demos + source** — each card builds a real element and, on click, shows its
  verbatim source (imported via Vite `?raw`, so the code shown can never drift from the
  code that runs), syntax-highlighted with Shiki.
- **Sections** — `doran-calendar`, `doran-datepicker`, `doran-rangepicker`,
  `doran-agenda`, `doran-nlp-input`, and a Theming section, reachable from the side nav
  (which highlights the section you're viewing).
- **Language toggle** — switch the whole catalog and the elements between Persian and
  English (via the `locale` attribute); text direction follows the language automatically.
- **Theme toggle** — light/dark by flipping `data-doran-theme` on the page root.

## Using the elements

Importing the package registers the elements; then use them anywhere in your markup:

```html
<link rel="stylesheet" href="@doranjs/wc/styles.css" />
<script type="module">
  import '@doranjs/wc';
</script>

<doran-calendar show-holidays value="1405/03/12"></doran-calendar>
<doran-datepicker with-time></doran-datepicker>
<doran-rangepicker presets months="2"></doran-rangepicker>
<doran-nlp-input value="جمعه ساعت ۷ شب"></doran-nlp-input>
```

Listen for changes with standard DOM events:

```js
document.querySelector('doran-calendar').addEventListener('change', (e) => {
  console.log(e.detail.date, e.detail.value);
});
```

### From a CDN (no build step)

```html
<link rel="stylesheet" href="https://unpkg.com/@doranjs/wc/dist/styles.css" />
<script src="https://unpkg.com/@doranjs/wc/dist/doran.global.js"></script>
<doran-calendar></doran-calendar>
```

## Structure

```
src/
  app.ts                   shell: side nav, header, language/theme toggles, scroll-spy
  i18n/                    FA/EN dictionary; theme.ts holds light/dark state
  demo/                    createCard (Shiki), createSection, dom helper
  demos/<component>/       one self-contained file per variation (the “?raw” source)
  sections/                wires each element's demos into a section
```
