# @doranjs/vue

بایندینگ‌های اصطلاحیِ **Vue 3** برای دوران. کامپوننت‌ها wrapperهای نازکِ `v-model` روی
custom elementهای [`@doranjs/wc`](/api/wc) (موتور مشترک) هستند، پس منطقِ تقویم/گرید per-framework
بازنویسی نمی‌شود. قرارداد تغییر با [`@doranjs/react`](/api/react) یکسان است: `v-model` یک
`DoranDate` حمل می‌کند و رویدادِ `change` **علاوه بر آن** `Date`ِ میلادی را هم emit می‌کند.

```bash
pnpm add @doranjs/vue @doranjs/core vue
```

```ts
// main.ts — استایل‌ها را یک بار بارگذاری کنید
import '@doranjs/wc/styles.css';
```

## کامپوننت‌ها

| کامپوننت           | `v-model`                       | payload اضافیِ `change`                  |
| ------------------ | ------------------------------- | ---------------------------------------- |
| `DoranDatePicker`  | `DoranDate \| null`             | `Date \| null` میلادی                    |
| `DoranCalendar`    | `DoranDate \| null`             | `Date \| null` میلادی                    |
| `DoranRangePicker` | `{ start, end }` از `DoranDate` | `{ start, end }` میلادی                  |
| `DoranNlpInput`    | `string`                        | `resolve` / `change` با نتیجهٔ parse شده |
| `DoranAgenda`      | —                               | `selectday(DoranDate)`                   |

```vue
<script setup lang="ts">
import { shallowRef } from 'vue';
import { DoranDatePicker } from '@doranjs/vue';
import type { DoranDate } from '@doranjs/core';

// shallowRef: ‏DoranDate تغییرناپذیر است و نباید deep-proxy شود.
const date = shallowRef<DoranDate | null>(null);

function onChange(_doran: DoranDate | null, gregorian: Date | null) {
  // میلادیِ ISO را مستقیم به backend بفرستید.
  if (gregorian) fetch('/api/save', { body: JSON.stringify({ at: gregorian.toISOString() }) });
}
</script>

<template>
  <DoranDatePicker v-model="date" locale="fa" @change="onChange" />
</template>
```

هر attribute‌ای که عنصرِ زیرین پشتیبانی می‌کند (`locale`، `placeholder`، `format`،
`with-time`، `min`، `max`، …) مستقیماً pass می‌شود — فهرست کامل در [`@doranjs/wc`](/api/wc).

## سفارشی‌سازی DatePicker و فوتر

```vue
<DoranDatePicker
  v-model="date"
  footer-actions="today,clear"
  icon-position="right"
  text-align="left"
  input-width="18rem"
  dropdown-width="trigger"
/>
```

`footer-actions` ترتیب `today` و `clear` را حفظ می‌کند و مقدار خالی (`footer-actions=""`) کل
فوتر را پنهان می‌کند. «امروز» تاریخ امروز را انتخاب و `v-model`/`change` را به‌روزرسانی می‌کند؛
«پاک کردن» هر دو مقدار Doran و میلادی را `null` می‌کند. RangePicker به‌صورت پیش‌فرض کنترل
`clear` دارد؛ مقدار خالی فوتر و خلاصهٔ بازه را پنهان می‌کند. `hide-footer` منسوخ است. متن دکمه‌ها از locale فعال می‌آید: `fa` «امروز»/«پاک کردن» و `en`، Today/Clear را نشان می‌دهد.

`icon-position` و `text-align` مقدارهای `left`/`right` می‌گیرند. `input-width` یک عرض CSS است؛
`dropdown-width` می‌تواند `auto` (عرض ذاتی)، `trigger` (هم‌اندازهٔ ورودی) یا هر عرض CSS مثل
`24rem` باشد. `disabled` trigger وب‌کامپوننت را غیرفعال می‌کند؛ DatePicker باز نمی‌شود و
popover باز بسته می‌شود.

## headless — `useCalendarGrid`

برای markupِ کاملاً دلخواه، این composable همان `buildMonthGrid` / `navigateFocus`ِ مشترکِ
`@doranjs/wc` را دوباره استفاده می‌کند — بدون منطقِ گریدِ per-framework:

```ts
import { useCalendarGrid } from '@doranjs/vue';

const { cursor, grid, next, prev, move } = useCalendarGrid();
// grid.value.weeks → GridDay[][] (شنبه‌محور)؛ next()/prev() ماه‌ها را جابه‌جا می‌کنند.
```

## SSR

custom elementها سمتِ کلاینت هنگام mount بارگذاری می‌شوند (`@doranjs/wc` نسبت به SSR گارد
شده)، پس رندرِ سرور تگِ inert را emit می‌کند و hydration آن را upgrade می‌کند. برای اینکه
ارقام/تایم‌زون قطعی بمانند، برنامه را در `DoranProvider` بپیچید — این کامپوننت `locale`/`timeZone`
را برای subtree از طریقِ `provide`/`inject` تنظیم می‌کند، request-scoped (بدون globalِ mutable):

```vue
<script setup lang="ts">
import { DoranProvider, DoranDatePicker } from '@doranjs/vue';
</script>

<template>
  <DoranProvider locale="fa" timeZone="Asia/Tehran">
    <DoranDatePicker />
  </DoranProvider>
</template>
```

کامپوننت‌ها locale را به‌ترتیبِ **attrِ صریح → provider** resolve می‌کنند. برای قطعیتِ
locale/timezone [راهنمای SSR](/guide/ssr) را ببینید.
