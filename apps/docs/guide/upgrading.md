# ارتقا به ۰٫۵

هرچه در API تایپ‌اسکریپت هست افزوده شده — هیچ export، prop یا امضای callback حذف
نشده و رفتار controlled/uncontrolled دست‌نخورده است. **اگر روی جزئیات داخلی Doran
استایل ننوشته‌اید و تست‌هایتان تریگر پیکر را کوئری نمی‌کنند، بدون تغییر ارتقا دهید.**

آنچه عوض شده DOM است، چون تریگر انتخابگر تاریخ به یک ورودی متنی واقعی تبدیل شد. دو
نام کلاس قدیمی به‌عنوان alias نگه داشته شده‌اند تا بیشتر استایل‌شیت‌ها کار کنند، اما
سلکتورهای وضعیت قابل حفظ نبودند.

## تریگر حالا input است، نه button

```diff
- <button class="doran-datepicker__input">
-   <span class="doran-datepicker__value">۱۴۰۵/۰۳/۱۵</span>
-   <span class="doran-datepicker__icon">…</span>
- </button>
+ <div class="doran-datepicker__input">
+   <input class="doran-datepicker__control doran-datepicker__value" value="۱۴۰۵/۰۳/۱۵" />
+   <button class="doran-datepicker__icon">…</button>
+ </div>
```

`.doran-datepicker__input` همچنان نامِ کادرِ حاشیه‌دار است و خودِ input هم کلاس
`.doran-datepicker__value` را دارد، پس قواعدِ رنگ، فونت و تراز کار می‌کنند.

**در تست‌ها:**

```diff
- screen.getByRole('button', { name: /۱۴۰۵/ })
+ screen.getByRole('textbox')
```

آیکن تقویم حالا دکمهٔ مستقل خودش است با نام «باز کردن تقویم»:

```diff
- fireEvent.click(screen.getByRole('button'))
+ fireEvent.click(screen.getByRole('button', { name: /تقویم/ }))
```

## سلکتورهای وضعیت جابه‌جا شدند

یک `<div>` نمی‌تواند با `:disabled` مطابقت کند، و روزها دیگر به‌صورت نیتیو غیرفعال
نیستند — از `aria-disabled` استفاده می‌کنند تا قابل فوکوس بمانند و بتوانند دلیل
در دسترس نبودنشان را بگویند.

```diff
- .doran-datepicker__input:disabled       { … }
+ .doran-datepicker__input[data-disabled]  { … }

- .doran-datepicker__input:focus-visible  { … }
+ .doran-datepicker__input:focus-within    { … }

- .doran-day:disabled                     { … }
+ .doran-day[aria-disabled='true']         { … }
```

وقتی متنِ تایپ‌شده پارس نشود، `[data-invalid]` هم روی فیلد می‌آید که با
`--doran-input-invalid-border-color` استایل می‌گیرد.

## مقدار زمان هم input شد

```diff
- <span class="doran-time__value">۰۹</span>
+ <input class="doran-time__value" role="spinbutton" value="۰۹" />
```

عرضش `--doran-time-field-width` است با پیش‌فرض `2.4ch`.

## تغییرات رفتاری

- **تقویم هنگام باز شدن دیگر فوکوس نمی‌گیرد.** با تریگرِ متنی، گرفتن فوکوس مکان‌نما را
  وسط تایپ از فیلد بیرون می‌کشد. برای رسیدن به جدول Tab بزنید.
- **پاپ‌اور دیگر Tab را تله نمی‌کند.** چون `aria-modal="false"` اعلام می‌کند یعنی بقیهٔ
  صفحه در دسترس است و تله‌کردن این وعده را می‌شکست. Tab از هر دو سر آن را می‌بندد.
  Escape همچنان می‌بندد و فوکوس را برمی‌گرداند.
- **کلیدهای جهت از جهتِ locale پیروی می‌کنند.** در locale چپ‌به‌راست حالا `ArrowLeft`
  عقب می‌رود نه جلو.

## اگر نمی‌خواهید تایپ شود

`readOnly` فیلد را غیرقابل‌تایپ می‌کند و تقویم کاملاً کار می‌کند:

```tsx
<DoranDatePicker readOnly />
```
