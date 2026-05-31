# Doran — Next.js Example

Reference integration for the Next.js App Router. Because the Doran React components are
client components, import them inside files marked with `'use client'`, or wrap them in a
client boundary.

```tsx
'use client';
import '@doran/ui/styles.css';
import '@doran/react/styles.css';
import { DoranCalendar } from '@doran/react';

export default function Page() {
  return <DoranCalendar />;
}
```

> Scaffolding placeholder — run `pnpm create next-app` here and add the snippet above to
> wire Doran into a Next.js project.
