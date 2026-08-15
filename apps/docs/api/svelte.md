# @doranjs/svelte

بایندینگ‌های اصطلاحیِ **Svelte** برای دوران. با Svelte 4 و 5 کار می‌کند، از جمله SSRِ SvelteKit.
کامپوننت‌ها wrapperهای نازکِ `bind:value` روی custom elementهای [`@doranjs/wc`](/api/wc) (موتور
مشترک) هستند، پس منطقِ تقویم/گرید per-framework بازنویسی نمی‌شود. قرارداد تغییر با
[`@doranjs/react`](/api/react) یکسان است: `bind:value` یک `DoranDate` حمل می‌کند و رویدادِ
`change` **علاوه بر آن** `Date`ِ میلادی را هم گزارش می‌کند.

```bash
pnpm add @doranjs/svelte @doranjs/core svelte
```

```ts
// استایل‌ها را یک بار بارگذاری کنید (مثلاً در layoutِ ریشه)
import '@doranjs/wc/styles.css';
```

## کامپوننت‌ها

| کامپوننت           | `bind:value`                    | detailِ `change`                         |
| ------------------ | ------------------------------- | ---------------------------------------- |
| `DoranDatePicker`  | `DoranDate \| null`             | `{ value, gregorian: Date \| null }`     |
| `DoranCalendar`    | `DoranDate \| null`             | `{ value, gregorian: Date \| null }`     |
| `DoranRangePicker` | `{ start, end }` از `DoranDate` | `{ value, gregorian: { start, end } }`   |
| `DoranNlpInput`    | `string`                        | `resolve` / `change` با نتیجهٔ parse شده |
| `DoranAgenda`      | —                               | `selectday` → `DoranDate`                |

```svelte
<script lang="ts">
  import { DoranDatePicker } from '@doranjs/svelte';
  import type { DoranDate } from '@doranjs/core';

  let value: DoranDate | null = null;

  function onChange(e: CustomEvent<{ value: DoranDate | null; gregorian: Date | null }>) {
    // میلادیِ ISO را مستقیم به backend بفرستید.
    if (e.detail.gregorian) {
      fetch('/api/save', { body: JSON.stringify({ at: e.detail.gregorian.toISOString() }) });
    }
  }
</script>

<DoranDatePicker bind:value locale="fa" on:change={onChange} />
{#if value}<p>{value.format('dddd D MMMM YYYY')}</p>{/if}
```

هر attribute‌ای که عنصرِ زیرین پشتیبانی می‌کند (`locale`، `placeholder`، `format`، `with-time`،
`min`، `max`، …) از طریقِ `$$restProps` pass می‌شود — فهرست کامل در [`@doranjs/wc`](/api/wc).

## سفارشی‌سازی DatePicker و فوتر

```svelte
<DoranDatePicker
  bind:value
  footer-actions="today,clear"
  icon-position="right"
  text-align="left"
  input-width="18rem"
  dropdown-width="trigger"
/>
```

`footer-actions` ترتیب `today` و `clear` را حفظ می‌کند و مقدار خالی (`footer-actions=""`) کل
فوتر را پنهان می‌کند. «امروز» تاریخ امروز را انتخاب و `bind:value`/`change` را به‌روزرسانی
می‌کند؛ «پاک کردن» هر دو مقدار Doran و میلادی را `null` می‌کند. RangePicker به‌صورت پیش‌فرض
کنترل `clear` دارد؛ مقدار خالی فوتر و خلاصهٔ بازه را پنهان می‌کند. `hide-footer` منسوخ است. متن دکمه‌ها از locale فعال می‌آید: `fa` «امروز»/«پاک کردن» و `en`، Today/Clear را نشان می‌دهد.

`icon-position` و `text-align` مقدارهای `left`/`right` می‌گیرند. `input-width` یک عرض CSS است؛
`dropdown-width` می‌تواند `auto` (عرض ذاتی)، `trigger` (هم‌اندازهٔ ورودی) یا هر عرض CSS مثل
`24rem` باشد. `disabled` trigger وب‌کامپوننت را غیرفعال می‌کند؛ DatePicker باز نمی‌شود و
popover باز بسته می‌شود.

## headless — `createCalendarGrid`

برای markupِ کاملاً دلخواه، این store همان `buildMonthGrid` / `navigateFocus`ِ مشترکِ
`@doranjs/wc` را دوباره استفاده می‌کند — بدون منطقِ گریدِ per-framework:

```svelte
<script lang="ts">
  import { createCalendarGrid } from '@doranjs/svelte';
  const { cursor, grid, next, prev } = createCalendarGrid();
</script>

<button on:click={prev}>‹</button>
{#each $grid.weeks as week}
  {#each week as day}<span class:dim={!day.inCurrentMonth}>{day.day}</span>{/each}
{/each}
<button on:click={next}>›</button>
```

## SSR (SvelteKit)

custom elementها سمتِ کلاینت هنگام mount بارگذاری می‌شوند (`@doranjs/wc` نسبت به SSR گارد شده)،
پس رندرِ سرور تگِ inert را emit می‌کند و hydration آن را upgrade می‌کند. برای اینکه ارقام/تایم‌زون
قطعی بمانند، برنامه را (مثلاً در `+layout.svelte`) در `DoranProvider` بپیچید — این کامپوننت
`locale`/`timeZone` را برای subtree از طریقِ contextِ Svelte تنظیم می‌کند، request-scoped (بدون
globalِ mutable):

```svelte
<script lang="ts">
  import { DoranProvider, DoranDatePicker } from '@doranjs/svelte';
</script>

<DoranProvider locale="fa" timeZone="Asia/Tehran">
  <DoranDatePicker />
</DoranProvider>
```

کامپوننت‌ها locale را به‌ترتیبِ **attrِ صریح → provider** resolve می‌کنند. راهنمای
[SSR](/guide/ssr) را ببینید.

## ویجت روزها و اسلات‌ها

`dayData` و `disabledDates` propهای صریح‌اند، چون نگاشت و تابع از مرز attribute رد
نمی‌شوند. بقیه به‌صورت attribute عبور می‌کنند.

```svelte
<DoranCalendar bind:value {dayData} disabledDates={isBooked}>
  <span slot="legend">ظرفیت باقی‌مانده</span>
</DoranCalendar>
```

`legend`، `aside` و `footer` اسلات‌های light-DOM هستند که مستقیم به المنت می‌روند.

## انتخاب بازه با ورودی

```svelte
<DoranRangeDatePicker bind:value={range} presets months="2" />
```

یک تریگر با دو فیلد که هم تایپ می‌شوند و هم از جدول پر؛ ترتیب دو سر حفظ می‌شود.
`DoranRangePicker` همان نسخهٔ inline است.

## انتخاب زمان

`hour-step`، `minute-step`، `with-time` و `readonly` attribute هستند. گامِ همهٔ واحدها
پیش‌فرض `1` است و هر فیلد را می‌شود تایپ هم کرد.

## نحوهٔ نمایش

`mode="sheet"` — یا `"auto"` زیر ۶۴۰ پیکسل — پاپ‌اور را به شیت پایینی تبدیل می‌کند.
