# @doranjs/wc

**Web Component**های مستقل از framework (custom elementها) — دوران را در HTML ساده، یا با
Vue، Svelte، Angular یا هر frameworkی به‌کار ببرید.

## نصب (bundler)

```ts
import '@doranjs/wc'; // elementها را به‌صورت خودکار register می‌کند
import '@doranjs/wc/styles.css'; // tokenها + استایل کامپوننت‌ها در یک فایل
```

## از CDN (بدون build step)

```html
<link rel="stylesheet" href="https://unpkg.com/@doranjs/wc/dist/styles.css" />
<script src="https://unpkg.com/@doranjs/wc/dist/doran.global.js"></script>
```

## Elementها

| Tag                   | توضیح                                      |
| --------------------- | ------------------------------------------ |
| `<doran-calendar>`    | تقویم کامل ماه با انتخابگر ماه/سال/ساعت    |
| `<doran-datepicker>`  | ورودی همراه با تقویم pop-over              |
| `<doran-rangepicker>` | انتخاب بازهٔ تاریخ با دو کلیک              |
| `<doran-nlp-input>`   | ورودیِ زبان طبیعی با autocomplete + راهنما |

```html
<doran-calendar show-holidays value="1405/03/12" header-mode="dropdown"></doran-calendar>
<doran-datepicker with-time placeholder="تاریخ و ساعت"></doran-datepicker>
<doran-rangepicker show-holidays></doran-rangepicker>
<doran-nlp-input value="جمعه ساعت ۷ شب"></doran-nlp-input>
```

## Attributeها

| Attribute       | Elementها                         | توضیح                                    |
| --------------- | --------------------------------- | ---------------------------------------- |
| `value`         | calendar، datepicker، nlp-input   | `YYYY/MM/DD` (یا متن خام برای nlp-input) |
| `min` / `max`   | calendar، datepicker              | کران‌های قابل انتخاب                     |
| `locale`        | همه                               | `fa` (پیش‌فرض) یا `en`                   |
| `header-mode`   | calendar، rangepicker             | `dropdown` (پیش‌فرض) یا `separate`       |
| `with-time`     | calendar، datepicker              | فعال‌سازی انتخابگر ساعت                  |
| `show-holidays` | calendar، datepicker، rangepicker | نشانه‌گذاری تعطیلات رسمی                 |
| `weekends`      | calendar، rangepicker             | اندیس روزهای هفته با کاما (`6` = جمعه)   |
| `placeholder`   | datepicker، nlp-input             | متن placeholder                          |
| `format`        | datepicker، nlp-input             | الگوی format برای نمایش/پیش‌نمایش        |

## Eventها

همهٔ elementها یک `change` `CustomEvent`ِ bubbling منتشر می‌کنند:

```js
document.querySelector('doran-calendar').addEventListener('change', (e) => {
  console.log(e.detail.date); // یک DoranDate
  console.log(e.detail.value); // رشتهٔ format‌شده
});

document.querySelector('doran-rangepicker').addEventListener('change', (e) => {
  console.log(e.detail.start, e.detail.end);
});

document.querySelector('doran-nlp-input').addEventListener('resolve', (e) => {
  console.log(e.detail.result); // ParseResult | null
});
```

## Theming

این elementها همان class nameها و CSS variableهای کامپوننت‌های React را به‌کار می‌برند، پس
[مجموعهٔ کامل tokenها](/api/ui) اعمال می‌شود. هر instance را با inline style جداگانه override کنید:

```html
<doran-calendar style="--doran-day-selected-bg: #e11d48; --doran-calendar-radius: 22px">
</doran-calendar>
```
