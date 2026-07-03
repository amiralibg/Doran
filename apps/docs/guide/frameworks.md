# بایندینگ‌های فریم‌ورک

دوران چهار بایندینگِ فریم‌ورک دارد که همه روی همان موتورِ مشترک — custom elementهای
[`@doranjs/wc`](/api/wc) — سوارند. منطقِ تقویم/گرید یک بار نوشته شده و per-framework بازنویسی
نمی‌شود؛ هر بایندینگ فقط قرارداد اصطلاحیِ همان فریم‌ورک را روی آن می‌گذارد. قرارداد تغییر همه‌جا
یکسان است: مقدار یک `DoranDate` است و رویدادِ `change` **علاوه بر آن** `Date`ِ میلادی را برای
backend گزارش می‌کند.

## مقایسهٔ کنار هم

|                   | ‏ [React](/api/react)   | ‏ [Vue](/api/vue) | ‏ [Svelte](/api/svelte) | ‏ [Angular](/api/angular)        |
| ----------------- | ----------------------- | ----------------- | ----------------------- | -------------------------------- |
| نصب               | `@doranjs/react`        | `@doranjs/vue`    | `@doranjs/svelte`       | `@doranjs/angular`               |
| اتصالِ مقدار      | `value`/`onChange`      | `v-model`         | `bind:value`            | `[formControl]` (CVA)            |
| نوعِ مقدار        | `DoranDate`             | `DoranDate`       | `DoranDate`             | `DoranDate`                      |
| میلادی از         | آرگومان دومِ `onChange` | payloadِ `change` | `change` detail         | payloadِ `(change)`              |
| گریدِ headless    | `useCalendar`           | `useCalendarGrid` | `createCalendarGrid`    | `createCalendarGrid` (signals)   |
| Provider          | `DoranProvider`         | `DoranProvider`   | `DoranProvider`         | `dr-provider` / `DORAN_DEFAULTS` |
| مکانیزمِ provider | context                 | provide/inject    | context                 | DI                               |

هر چهار بایندینگ همان مجموعه کامپوننت را نمایش می‌دهند: `DoranDatePicker`، `DoranCalendar`،
`DoranRangePicker`، `DoranNlpInput` و `DoranAgenda`. هر attribute‌ای که عنصرِ زیرین پشتیبانی می‌کند
(`locale`، `format`، `with-time`، `min`، `max`، …) مستقیماً pass می‌شود — فهرست کامل در
[`@doranjs/wc`](/api/wc).

## اعتبارسنجی و فرم‌ها

برای اعتبارسنجیِ framework-agnostic، [`@doranjs/zod`](/api/zod) یک schemaِ `zDoranDate()` می‌دهد که
از رشتهٔ ISO، `Date`، epoch یا `DoranDate` به `DoranDate` coerce می‌کند و از طریقِ resolverِ zodِ هر
stack (react-hook-form، VeeValidate، superforms و …) داخلِ فرم‌ها می‌افتد.

## SSR

`@doranjs/wc` نسبت به SSR گارد شده، پس رندرِ سرور تگِ inert را emit می‌کند و hydration آن را
upgrade می‌کند. برای قطعیتِ ارقام/تایم‌زون بین دو pass، برنامه را در `DoranProvider` بپیچید. جزئیات
در [راهنمای SSR](/guide/ssr).
