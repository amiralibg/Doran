---
'@doranjs/svelte': patch
---

Fix `DoranAgenda` dropping `start`, `events`, and `renderEvent`. These are element
properties (not attributes), so the binding now assigns them after the lazy
`@doranjs/wc` import upgrades the custom element — the same post-upgrade sync the
other components use for `value`. Previously they were spread through `$$restProps`
and lost, so the agenda rendered today's week with no events.
