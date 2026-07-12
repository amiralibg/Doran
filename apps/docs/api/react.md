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

## propهای `DoranDatePicker`

| Prop              | Type                                                         | پیش‌فرض              | توضیح                                                           |
| ----------------- | ------------------------------------------------------------ | -------------------- | --------------------------------------------------------------- |
| `value`           | `DoranDate \| null`                                          | —                    | مقدار controlled                                                |
| `defaultValue`    | `DoranDate \| null`                                          | —                    | مقدار اولیهٔ uncontrolled                                       |
| `onChange`        | `(date: DoranDate \| null, gregorian: Date \| null) => void` | —                    | هنگام انتخاب یا پاک‌کردن؛ آرگومان دوم `Date` نیتیو برای backend |
| `locale`          | `Locale \| string`                                           | `getDefaultLocale()` | locale قالب‌بندی — از پیش‌فرض جهانی fallback می‌کند             |
| `format`          | `string`                                                     | `'YYYY/MM/DD'`       | الگوی نمایش                                                     |
| `placeholder`     | `string`                                                     | `'انتخاب تاریخ'`     | placeholder ورودی                                               |
| `footerActions`   | `readonly ('today' \| 'clear')[]`                            | `['today']`          | اکشن‌های مرتبِ فوتر؛ آرایهٔ خالی فوتر را پنهان می‌کند           |
| `hideFooter`      | `boolean`                                                    | `false`              | منسوخ؛ به‌جای آن `footerActions={[]}` را استفاده کنید           |
| `iconPosition`    | `'left' \| 'right'`                                          | `'left'`             | جای آیکن در trigger                                             |
| `textAlign`       | `'left' \| 'right'`                                          | `'right'`            | تراز متن trigger                                                |
| `inputWidth`      | `CSSProperties['width']`                                     | —                    | عرض trigger؛ عددها برحسب پیکسل‌اند                              |
| `dropdownWidth`   | `'auto' \| 'trigger' \| CSSProperties['width']`              | `'auto'`             | عرض ذاتی، برابر trigger، یا یک عرض CSS سفارشی                   |
| `min`             | `DoranDate`                                                  | —                    | زودترین تاریخ قابل انتخاب                                       |
| `max`             | `DoranDate`                                                  | —                    | دیرترین تاریخ قابل انتخاب                                       |
| `disabled`        | `boolean`                                                    | `false`              | غیرفعال کردن ورودی                                              |
| `className`       | `string`                                                     | —                    | کلاس اضافه‌شده به عنصر root                                     |
| `style`           | `CSSProperties`                                              | —                    | استایل inline فوروارد به root                                   |
| `id`              | `string`                                                     | —                    | `id` فوروارد به root                                            |
| `size`            | `'sm' \| 'md' \| 'lg'`                                       | —                    | ارتفاع‌های پیش‌تعریف: 32 / 40 / 48 پیکسل                        |
| `withTime`        | `boolean`                                                    | `false`              | نمایش انتخابگر ساعت                                             |
| `headerMode`      | `'dropdown' \| 'separate'`                                   | `'dropdown'`         | پنل‌های ماه/سال یا `<select>`های نیتیو                          |
| `minuteStep`      | `number`                                                     | `1`                  | گام دقیقه                                                       |
| `isHoliday`       | `(day: DoranDate) => boolean`                                | —                    | نشانه‌گذاری تعطیل                                               |
| `weekends`        | `number[]`                                                   | `[6]`                | اندیس‌های آخر هفته (۰ = شنبه)                                   |
| `arrows`          | `{ prev, next }`                                             | chevron              | گره‌های فلش سفارشی                                              |
| `showOutsideDays` | `boolean`                                                    | —                    | نمایش روزهای ماه‌های مجاور                                      |

```tsx
// ارسال تاریخ به backend
<DoranDatePicker
  size="md"
  style={{ width: 200 }}
  onChange={(d, gregorian) => {
    if (d && gregorian) await api.post('/events', { date: gregorian.toISOString() });
  }}
/>;

// locale جهانی — یک بار در root برنامه:
setDefaultLocale(enUS); // همهٔ pickerها بدون prop اضافه به انگلیسی تبدیل می‌شوند
```

## propهای `DoranRangePicker`

| Prop             | Type                                                        | پیش‌فرض              | توضیح                                                 |
| ---------------- | ----------------------------------------------------------- | -------------------- | ----------------------------------------------------- |
| `value`          | `DateRange`                                                 | —                    | بازهٔ controlled                                      |
| `defaultValue`   | `DateRange`                                                 | —                    | بازهٔ اولیه                                           |
| `onChange`       | `(range: DateRange, gregorian: GregorianDateRange) => void` | —                    | آرگومان دوم، شامل `Date` نیتیو برای start/end         |
| `locale`         | `Locale \| string`                                          | `getDefaultLocale()` | از پیش‌فرض جهانی fallback می‌کند                      |
| `numberOfMonths` | `number`                                                    | `1`                  | تعداد ماه‌های نمایش داده‌شده                          |
| `presets`        | `boolean \| RangePreset[]`                                  | —                    | `true` برای presetهای آماده                           |
| `footerActions`  | `readonly 'clear'[]`                                        | `['clear']`          | کنترل پاک‌کردن فوتر؛ آرایهٔ خالی فوتر را پنهان می‌کند |
| `isHoliday`      | `(day: DoranDate) => boolean`                               | —                    | نشانه‌گذاری تعطیل                                     |
| `weekends`       | `number[]`                                                  | `[6]`                | اندیس‌های آخر هفته                                    |

```tsx
import { DoranRangePicker, type GregorianDateRange } from '@doranjs/react';

<DoranRangePicker
  presets
  onChange={(range, { start, end }) => {
    if (start && end) {
      setFilter({ from: start.toISOString(), to: end.toISOString() });
    }
  }}
/>;
```

## اکشن‌های فوتر

`DoranCalendar` و `DoranDatePicker` با `footerActions` ترتیب دکمه‌های `today` و `clear` را
می‌گیرند؛ مثلاً `['today', 'clear']`. آرایهٔ خالی کل فوتر را پنهان می‌کند. «امروز» تاریخ امروز
را انتخاب می‌کند و `onChange` را صدا می‌زند؛ «پاک کردن» مقدار را پاک می‌کند و
`onChange(null)` (و در DatePicker آرگومان دوم `null`) را emit می‌کند.

`DoranRangePicker` به‌صورت پیش‌فرض کنترل `clear` را در فوتر نشان می‌دهد؛
`footerActions={[]}` آن را همراه با خلاصهٔ بازه پنهان می‌کند. `hideFooter` فقط برای سازگاری
قدیمی باقی مانده و منسوخ است.

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
