# Doran — Vanilla / Web Components example

Uses [`@doranjs/wc`](../../packages/wc) custom elements in a plain HTML page — no
framework required.

```bash
pnpm --filter doran-example-vanilla dev
```

## Usage

Importing the package registers the elements; then use them anywhere in your markup:

```html
<link rel="stylesheet" href="@doranjs/wc/styles.css" />
<script type="module">
  import '@doranjs/wc';
</script>

<doran-calendar show-holidays value="1405/03/12"></doran-calendar>
<doran-datepicker with-time></doran-datepicker>
<doran-rangepicker></doran-rangepicker>
<doran-nlp-input value="جمعه ساعت ۷ شب"></doran-nlp-input>
```

### From a CDN (no build step)

```html
<link rel="stylesheet" href="https://unpkg.com/@doranjs/wc/dist/styles.css" />
<script src="https://unpkg.com/@doranjs/wc/dist/doran.global.js"></script>
<doran-calendar></doran-calendar>
```

Listen for changes with standard DOM events:

```js
document.querySelector('doran-calendar').addEventListener('change', (e) => {
  console.log(e.detail.date, e.detail.value);
});
```
