---
'@doranjs/core': patch
---

Replace raw NUL bytes (U+0000) in the parse compile-cache key with `\u0000` escape sequences. The literal control characters shipped verbatim in the published dist and broke consumers whose bundler executes modules via `eval(TrustedScript)` — Firefox truncates the script at the first NUL, throwing `SyntaxError: ` literal not terminated before end of script`` (seen with Next.js dev mode on Firefox 133+). The cache key value is unchanged; the source and dist are now clean ASCII.
