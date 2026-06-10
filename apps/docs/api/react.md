# @doranjs/react

کامپوننت‌های تقویمِ React با پشتیبانی RTL و accessible.

```ts
import '@doranjs/ui/styles.css';
import '@doranjs/react/styles.css';
```

## کامپوننت‌ها

| کامپوننت           | توضیح                                      |
| ------------------ | ------------------------------------------ |
| `DoranCalendar`    | تقویم کامل ماه با ناوبریِ header           |
| `DoranMonthView`   | یک گریدِ ماهِ accessible (بلوک سازنده)     |
| `DoranDatePicker`  | ورودی همراه با تقویم pop-over              |
| `DoranRangePicker` | انتخاب بازهٔ تاریخ با دو کلیک              |
| `DoranTimePicker`  | انتخابگرِ مستقلِ ساعت/دقیقه                |
| `DoranNlpInput`    | ورودیِ زبان طبیعی با autocomplete + راهنما |
| `DoranAgenda`      | اجندای عمودیِ روزبه‌روز همراه با رویدادها  |

```tsx
import { DoranCalendar, DoranDatePicker } from '@doranjs/react';

<DoranCalendar defaultValue={DoranDate.now()} onChange={(d) => ...} />
<DoranDatePicker placeholder="انتخاب تاریخ" />
```

## انتخاب ماه، سال و ساعت

`DoranCalendar` (و `DoranDatePicker`) این propها را می‌پذیرند:

| Prop         | Type                       | پیش‌فرض      | توضیح                                              |
| ------------ | -------------------------- | ------------ | -------------------------------------------------- |
| `headerMode` | `'dropdown' \| 'separate'` | `'dropdown'` | پنل‌های درجای ماه/سال، یا `<select>`های نیتیو      |
| `withTime`   | `boolean`                  | `false`      | نمایش انتخابگر ساعت و حمل زمان روی مقدار           |
| `minuteStep` | `number`                   | `1`          | گام افزایش دقیقه در stepperِ زمان                  |
| `isHoliday`  | `(day) => boolean`         | —            | نشانه‌گذاری روزهای تعطیل (نقطه + رنگ تعطیل)        |
| `weekends`   | `number[]`                 | `[6]`        | اندیس روزهایی که آخر هفته شمرده می‌شوند (۰ = شنبه) |
| `arrows`     | `{ prev, next }`           | chevron      | گره‌های سفارشیِ فلش ناوبری                         |

```tsx
import { getHolidaysOn } from '@doranjs/holidays';

<DoranCalendar
  withTime
  headerMode="dropdown"
  isHoliday={(d) => getHolidaysOn(d).some((h) => h.official)}
/>;
```

## ورودیِ زبان طبیعی

```tsx
import { DoranNlpInput } from '@doranjs/react';

<DoranNlpInput placeholder="مثلاً: جمعه ساعت ۷ شب" onResolve={(r) => console.log(r?.date)} />;
```

یک dropdownِ autocompleteِ زنده و یک راهنمای تاریخِ resolve‌شده نشان می‌دهد که به سرِ مخالف
(LTR)ِ فیلد سنجاق می‌شود. هوک headlessِ `useNlpSuggest(text, options)` مقدار
`{ result, suggestions }` را برای ساخت UI دلخواهتان برمی‌گرداند.

## Theming

هر بخش CSS variable مخصوص خودش را می‌خواند، پس می‌توانید یک instance را بدون override کردنِ
کل کامپوننت‌ها بازطراحی کنید — رنگ‌ها، فونت‌ها، سایه‌ها، borderها، گردی‌ها و فلش‌ها:

```tsx
<div style={{ '--doran-day-selected-bg': '#e11d48', '--doran-calendar-radius': '22px' }}>
  <DoranCalendar />
</div>
```

برای فهرست کامل tokenها [`@doranjs/ui`](/api/ui) را ببینید.

## Primitiveهای headless

```tsx
import { useCalendar, useDateRange, buildMonthGrid } from '@doranjs/react';

const { grid, goToNextMonth, select, isSelected } = useCalendar();
const grid = buildMonthGrid(1405, 3); // خالص، بدون React
```

همهٔ کامپوننت‌ها از ناوبریِ کیبورد (فلش‌ها، Home/End، Enter/Space)، semanticهای گریدِ ARIA،
dark mode و چیدمان‌های موبایل پشتیبانی می‌کنند.
