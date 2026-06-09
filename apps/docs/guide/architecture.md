# معماری

دوران از **مرزبندی بسته‌ها بر پایهٔ domain** با یک dependency graph یک‌سویه و سخت‌گیرانه
پیروی می‌کند. هر بسته مسئول یک concern واحد است و یک API پایدار و strongly-typed عرضه می‌کند.

## Dependency graph

```
@doranjs/holidays ─┐        ┌── @doranjs/nlp
                   ▼        ▼
                 @doranjs/core
                   ▲        ▲
@doranjs/react ────┘        └──── @doranjs/wc
   │  (همچنین → @doranjs/nlp)       (همچنین → @doranjs/nlp + @doranjs/holidays)
   └──▶ @doranjs/ui  (peer، برای theming)
```

- **`@doranjs/core`** هیچ runtime dependency ندارد و از UI بی‌خبر است.
- **`@doranjs/nlp`** و **`@doranjs/holidays`** تنها به core وابسته‌اند.
- **`@doranjs/react`** به core و **`@doranjs/nlp`** (برای ورودیِ زبان طبیعی) وابسته است و
  از **`@doranjs/ui`** به‌عنوان یک peer برای theming و primitiveها استفاده می‌کند.
- **`@doranjs/wc`** یک‌سری Web Componentِ مستقل از framework عرضه می‌کند که بر پایهٔ core،
  **`@doranjs/nlp`** و **`@doranjs/holidays`** ساخته شده‌اند — قابل‌استفاده در HTML ساده یا هر frameworkی.
- **`@doranjs/ui`** یک design system مستقل است (همان UI peerِ مربوط به `@doranjs/react`).

## تصمیم‌های کلیدی طراحی

### Immutability

`DoranDate` تغییرناپذیر (immutable) است. هر عملیات یک instance تازه برمی‌گرداند، که تاریخ‌ها را
برای share کردن، memoize و استفاده به‌عنوان state در React امن می‌کند.

### مدل Instant + Time zone

یک `DoranDate` یک instant مطلق (epoch milliseconds) و یک IANA time zone را نگه می‌دارد.
فیلدهای civil (wall-clock) جلالی با project کردن آن instant در time zone مربوطه _محاسبه_
می‌شوند. این کار هر تبدیل و هر تغییر time zone را دقیق نگه می‌دارد و کاملاً روی API استاندارد
`Intl` پیاده‌سازی شده است — هیچ time-zone database ای همراه بسته ارسال نمی‌شود.

### محور Julian Day Number (JDN)

همهٔ تبدیل‌های تقویمی حول **Julian Day Number (JDN)** می‌چرخند. هر دو تبدیل Gregorian↔JDN و
Jalali↔JDN عملیات integer دقیق‌اند، پس محاسبهٔ روزها ساده است و round-tripها هرگز drift
نمی‌کنند. الگوریتم جلالی همان پیاده‌سازی جاافتادهٔ Borkowski / jalaali است که با یک تست
round-trip روزبه‌روز اعتبارسنجی شده است.

### محاسبهٔ Calendar در برابر Duration

- **Calendar units** (`addDays`، `addMonths`، `addYears`) روی فیلدهای civil عمل می‌کنند و
  روزهای سرریز را clamp می‌کنند (مثلاً ۳۰ اسفند → ۲۹ در سال عادی).
- **Duration units** (`addHours`، `addMinutes`، …) روی instant مطلق عمل می‌کنند.

این رفتار با شیوهٔ استدلال انسان دربارهٔ «ماه بعد» در برابر «۲۴ ساعت دیگر» هم‌خوانی دارد.

## Extensibility

- **Locales** — localeهای بیشتری را با `registerLocale` ثبت کنید.
- **NLP** — این parser یک pipeline از day/time extractorهاست؛ extractorهای خودتان را با
  `Parser.useDay` / `Parser.useTime` ثبت کنید و Finglish aliasها را با `registerFinglish` بیفزایید.
- **Holidays** — تعطیلات شمسی یا قمریِ سفارشی را register کنید.
- **React** — هر کامپوننت بر پایهٔ headless primitiveها (`buildMonthGrid`، `useCalendar`،
  `useDateRange`، `useNlpSuggest`) ساخته شده که با آن‌ها می‌توانید یک UI سفارشی بسازید.
- **Web Components** — همان UI در قالب custom element (`<doran-calendar>`، …) برای هر
  framework یا HTML ساده؛ [`@doranjs/wc`](/en/api/wc) را ببینید.

## معیار کیفیت

صحتِ calendar نخستین اولویت پروژه است. هر تغییر در منطق conversion، leap-year یا arithmetic
باید همراه با testهایی باشد که تاریخ‌های مرجع، edge caseهای سال کبیسه و round-trip conversions
را پوشش دهند.
