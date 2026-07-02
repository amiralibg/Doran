# دوران با SSR

اپلیکیشن‌های رندرشده در سرور، مارک‌آپ را دو بار می‌سازند: یک‌بار در سرور و یک‌بار هنگام hydration در کلاینت. اگر این دو **بایت‌به‌بایت** یکسان نباشند، فریم‌ورک خطای hydration می‌دهد و HTML سرور را دور می‌ریزد. در کار با تاریخ، دو منبع کلاسیک برای این ناسازگاری وجود دارد:

1. **ارقام / Locale** — سرور `۱۴۰۳` (فارسی) رندر می‌کند اما کلاینت `1403` (لاتین) یا برعکس، چون locale میان این دو محیط فرق داشته است.
2. **منطقهٔ زمانی** — `DoranDate.now()` منطقهٔ زمانیِ _سیستم_ را می‌خواند. سرورِ `UTC` و مرورگرِ `Asia/Tehran` می‌توانند به روزهای متفاوتی برسند، پس «امروز» (و هر ماهِ پیش‌فرضی که از آن مشتق می‌شود) فرق می‌کند.

دوران طوری طراحی شده که هر دو را قطعی (deterministic) کند.

## دو قاعده

**۱. Locale را ثابت کن — به گلوبالِ قابل‌تغییر تکیه نکن.**
`setDefaultLocale()` یک singletonِ سطح-ماژول را تغییر می‌دهد. روی سروری که هم‌زمان چند درخواست را سرویس می‌دهد این خطرناک است، و اگر سرور و کلاینت اختلاف داشته باشند ناسازگاریِ ارقام رخ می‌دهد. به‌جایش locale را با یک **provider** (پایین‌تر) محدود کن یا `locale` را صراحتاً پاس بده.

**۲. «اکنون» را ثابت کن — نگذار دو محیط هرکدام جداگانه `Date.now()` صدا بزنند.**
لحظهٔ مرجع را یک‌بار حساب کن و پایین بفرست، یا ساعت را فریز کن. گزینه‌ها، از ارزان به گران:

```ts
import { DoranDate, freeze } from '@doranjs/core';

// (الف) یک مقدار/today صریح پاس بده تا چیزی از ساعتِ محیط مشتق نشود.
const today = DoranDate.now({ timeZone: 'Asia/Tehran' });

// (ب) یا ساعت را برای رندر فریز کن (برای تست‌ها هم عالی است).
freeze(DoranDate.fromGregorian(new Date('2026-07-02T00:00:00Z')));
```

هرجا لحظه مهم است، همیشه `timeZone` را صریح بده تا سرور و کلاینت مستقل از محل اجرا هم‌نظر بمانند.

## پرایمیتیوِ Provider

هر بایندینگِ فریم‌ورک یک `DoranProvider` دارد که `locale` (و `timeZone`) را برای زیردرختش تنظیم می‌کند. این provider **request-scoped** است، نه گلوبال، پس زیر SSR امن است — کامپوننت‌ها locale خود را این‌طور حل می‌کنند: **prop صریح ← provider ← پیش‌فرض گلوبال**.

::: code-group

```tsx [React / Next.js]
import { DoranProvider, DoranDatePicker } from '@doranjs/react';
import { faIR } from '@doranjs/core';

export default function Page() {
  return (
    <DoranProvider locale={faIR} timeZone="Asia/Tehran">
      <DoranDatePicker />
    </DoranProvider>
  );
}
```

```vue [Vue / Nuxt]
<script setup lang="ts">
import { DoranProvider, DoranDatePicker } from '@doranjs/vue';
</script>

<template>
  <DoranProvider locale="fa" timeZone="Asia/Tehran">
    <DoranDatePicker />
  </DoranProvider>
</template>
```

```svelte [Svelte / SvelteKit]
<script lang="ts">
  import { DoranProvider, DoranDatePicker } from '@doranjs/svelte';
</script>

<DoranProvider locale="fa" timeZone="Asia/Tehran">
  <DoranDatePicker />
</DoranProvider>
```

```ts [Angular / Universal]
import { Component } from '@angular/core';
import { DoranProvider, DoranDatePicker } from '@doranjs/angular';

@Component({
  standalone: true,
  imports: [DoranProvider, DoranDatePicker],
  template: `
    <dr-provider locale="fa" timeZone="Asia/Tehran">
      <dr-date-picker />
    </dr-provider>
  `,
})
export class AppComponent {}
```

:::

> `DoranProvider` در React یک شیءِ `Locale` می‌گیرد (`faIR` / `enUS`). بایندینگ‌های مبتنی‌بر وب‌کامپوننت (Vue / Svelte / Angular) رشتهٔ **صفتِ** `locale` را می‌گیرند (`'fa'` / `'en'`)، هماهنگ با `@doranjs/wc`.

## نکته‌های هر فریم‌ورک

### Next.js

کامپوننت‌های React از نوع client هستند (`'use client'`). `DoranProvider` را داخل یک مرز client رندر کن و `locale`/`timeZone` را از کانفیگ سرور بده تا هر دو پاس هم‌نظر باشند. چون دوران به‌جای گلوبالِ قابل‌تغییر از طریق provider فرمت می‌کند، ارقام در سرور و کلاینت یکسان‌اند.

### Nuxt

`@doranjs/vue` روی `@doranjs/wc` ساخته شده که کاستوم‌المنت‌ها را **فقط در کلاینت** ثبت می‌کند (SSR-guarded). سرور تگِ بی‌اثرِ `<doran-*>` را می‌سازد و مرورگر هنگام mount آن را ارتقا می‌دهد — بدون ناسازگاری، چون نام تگ و صفتِ `locale` که provider تنظیم می‌کند در هر دو پاس یکسان است. اگر از خود المنت‌های خام هم استفاده می‌کنی، `doran-*` را به `vue.compilerOptions.isCustomElement` اضافه کن.

### SvelteKit

همان مدل: کاستوم‌المنت‌ها در `onMount` بار می‌شوند، پس خروجی سرور تگِ بی‌اثر است. `DoranProvider` را در `+layout.svelte` ریشه بگذار و `locale` را از `event.locals`/کانفیگ بده تا هر درخواست قطعی رندر شود.

### Angular Universal

`@doranjs/angular` کامپوننت‌های standaloneِ partial-Ivy می‌فرستد. المنت‌ها در مرورگر بعد از `ngAfterViewInit` ارتقا می‌یابند؛ سرور تگِ بی‌اثر را با صفتِ `locale` از `dr-provider` می‌سازد. `locale`/`timeZone` را در ریشه بده تا کل اپ سازگار باشد.

## چک‌لیست

- [ ] اپ (یا زیردرخت) را با `DoranProvider` و یک `locale` صریح بپیچ.
- [ ] هرجا لحظه مهم است `timeZone` صریح بده؛ برای تقویم‌های بدون مقدار، یک `value`/`today` که یک‌بار حساب شده پاس بده.
- [ ] `setDefaultLocale()` را فقط در کلاینت صدا نزن.
- [ ] برای اسنپ‌شات/تست قطعی، ساعت را `freeze()` کن.
