---
'@doranjs/react': minor
'@doranjs/vue': minor
'@doranjs/svelte': minor
'@doranjs/angular': minor
---

**SSR-safe `DoranProvider` for every framework binding** ([#26](https://github.com/amiralibg/Doran/issues/26)).

Locale (Persian vs Latin digits) and time zone can differ between server and client, causing hydration mismatches. Each binding now ships a request-scoped provider that sets subtree defaults without touching the mutable global `setDefaultLocale()`:

- `DoranProvider` for React (Context), Vue (`provide`/`inject`), Svelte (context), and Angular (`dr-provider`, DI token `DORAN_DEFAULTS`).
- Components resolve their locale as **explicit prop → provider → global default**; React takes a `Locale` object, the wc-based bindings take the `locale` attribute string (`'fa'`/`'en'`).
- New **"Doran with SSR"** guide covering hydration pitfalls across Next.js, Nuxt, SvelteKit, and Angular Universal.
