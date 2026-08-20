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

| Prop              | Type                                                         | پیش‌فرض              | توضیح                                                                                                         |
| ----------------- | ------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `value`           | `DoranDate \| null`                                          | —                    | مقدار controlled                                                                                              |
| `defaultValue`    | `DoranDate \| null`                                          | —                    | مقدار اولیهٔ uncontrolled                                                                                     |
| `onChange`        | `(date: DoranDate \| null, gregorian: Date \| null) => void` | —                    | هنگام انتخاب یا پاک‌کردن؛ آرگومان دوم `Date` نیتیو برای backend                                               |
| `locale`          | `Locale \| string`                                           | `getDefaultLocale()` | locale قالب‌بندی — از پیش‌فرض جهانی fallback می‌کند                                                           |
| `format`          | `string`                                                     | `'YYYY/MM/DD'`       | الگوی نمایش؛ ارقامِ تایپ‌شده همین‌طور که وارد می‌شوند در این قالب mask می‌شوند و متن با همین الگو پارس می‌شود |
| `placeholder`     | `string`                                                     | `'انتخاب تاریخ'`     | placeholder ورودی                                                                                             |
| `footerActions`   | `readonly ('today' \| 'clear')[]`                            | `['today']`          | اکشن‌های مرتبِ فوتر؛ آرایهٔ خالی فوتر را پنهان می‌کند                                                         |
| `hideFooter`      | `boolean`                                                    | `false`              | منسوخ؛ به‌جای آن `footerActions={[]}` را استفاده کنید                                                         |
| `iconPosition`    | `'left' \| 'right'`                                          | `'left'`             | جای آیکن در trigger                                                                                           |
| `textAlign`       | `'left' \| 'right'`                                          | `'right'`            | تراز متن trigger                                                                                              |
| `inputWidth`      | `CSSProperties['width']`                                     | —                    | عرض trigger؛ عددها برحسب پیکسل‌اند                                                                            |
| `dropdownWidth`   | `'auto' \| 'trigger' \| CSSProperties['width']`              | `'auto'`             | عرض ذاتی، برابر trigger، یا یک عرض CSS سفارشی                                                                 |
| `min`             | `DoranDate`                                                  | —                    | زودترین تاریخ قابل انتخاب                                                                                     |
| `max`             | `DoranDate`                                                  | —                    | دیرترین تاریخ قابل انتخاب                                                                                     |
| `disabled`        | `boolean`                                                    | `false`              | غیرفعال کردن ورودی                                                                                            |
| `className`       | `string`                                                     | —                    | کلاس اضافه‌شده به عنصر root                                                                                   |
| `style`           | `CSSProperties`                                              | —                    | استایل inline فوروارد به root                                                                                 |
| `id`              | `string`                                                     | —                    | `id` فوروارد به root                                                                                          |
| `size`            | `'sm' \| 'md' \| 'lg'`                                       | —                    | ارتفاع‌های پیش‌تعریف: 32 / 40 / 48 پیکسل                                                                      |
| `withTime`        | `boolean`                                                    | `false`              | نمایش انتخابگر ساعت                                                                                           |
| `headerMode`      | `'dropdown' \| 'separate'`                                   | `'dropdown'`         | پنل‌های ماه/سال یا `<select>`های نیتیو                                                                        |
| `minuteStep`      | `number`                                                     | `1`                  | گام دقیقه                                                                                                     |
| `isHoliday`       | `(day: DoranDate) => boolean`                                | —                    | نشانه‌گذاری تعطیل                                                                                             |
| `weekends`        | `number[]`                                                   | `[6]`                | اندیس‌های آخر هفته (۰ = شنبه)                                                                                 |
| `arrows`          | `{ prev, next }`                                             | chevron              | گره‌های فلش سفارشی                                                                                            |
| `showOutsideDays` | `boolean`                                                    | —                    | نمایش روزهای ماه‌های مجاور                                                                                    |

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
setDefaultLocale(enUS); // نام‌ها، ارقام و دکمه‌های فوتر همهٔ pickerها انگلیسی می‌شوند
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
قدیمی باقی مانده و منسوخ است. متن دکمه‌ها از locale فعال می‌آید: `faIR` «امروز»/«پاک کردن» و `enUS`، Today/Clear را نشان می‌دهد.

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

## تایپ تاریخ

تریگر یک ورودی متنی واقعی است، پس تاریخ را هم می‌شود تایپ کرد و هم انتخاب.
ارقام همین‌طور که وارد می‌شوند در قالبِ `format` mask می‌شوند: تایپ `14020512`
بدون زدن جداکننده `۱۴۰۲/۰۵/۱۲` را نشان می‌دهد و backspace از جداکننده‌ها هم رد
می‌شود. `1402/5/12`، `1402-5-12` و `۱۴۰۲/۰۵/۱۲` هم همه پارس می‌شوند.

فیلدها دقیقاً مثل یک ورودی تاریخ نیتیو جلو می‌روند. رقمی که در فیلد فعلی جا نمی‌شود
به فیلد بعدی می‌رود: `95` ماه نیست، پس `9` می‌شود ماه `09` و `5` روز را شروع می‌کند.
اگر خودتان جداکننده تایپ کنید، فیلد زودتر بسته می‌شود — و همین است که `1402-1-2` را
ماه ۱ و روز ۲ نگه می‌دارد نه ماه ۱۲.

با `format` سفارشی، هم نمایش و هم تایپ همان قالب را دنبال می‌کنند —
`format="MM-DD-YYYY"` ورودی‌هایی مثل `05-12-1402` را می‌پذیرد. `format`ی که از
tokenهای متنی ساخته شده (`MMMM`، `dddd`) قابل ماسک‌شدن نیست، پس آن فیلدها آزاد
می‌مانند و روی blur مرتب می‌شوند.

خطا هنگام خروج از فیلد نمایش داده می‌شود نه با هر کلید: در مسیر رسیدن به `1402/05/12`
مقدار از `1`، `14` و `140` عبور می‌کند و علامت‌زدن هرکدام یعنی فیلد تمام مدت قرمز باشد.
متنی که پارس نمی‌شود حذف نمی‌شود؛ نگه داشته و با `aria-invalid` علامت‌گذاری می‌شود و
`onParseError` گزارشش می‌دهد. اگر تاریخ باید حتماً از جدول انتخاب شود، `readOnly` بدهید.

تقویم با آیکن و با `ArrowDown` باز می‌شود و عمداً با فوکوس باز نمی‌شود، چون با تایپ
تداخل دارد. هنگام باز شدن هم فوکوس را نمی‌گیرد — این کار مکان‌نما را از فیلد بیرون می‌کشد.

## تریگری که تایپ نمی‌شود

با `editable={false}` تریگر به دکمه تبدیل می‌شود: کل فیلد تقویم را باز می‌کند و تاریخ
فقط از جدول انتخاب می‌شود.

```tsx
<DoranDatePicker editable={false} />
```

روی صفحه‌های لمسی معمولاً انتخاب بهتری است. فیلد متنی کیبورد صفحه‌کلید را روی تقویم
بالا می‌آورد، و رسیدن به پیکر یعنی زدن روی آیکن به‌جای هرجای فیلد.

این همان `readOnly` نیست: `readOnly` یک `<input>` واقعی نگه می‌دارد — فوکوس‌پذیر،
قابل انتخاب، و با همان روش ارسال‌شدنی — و فقط متن تازه را نمی‌پذیرد. `readOnly` برای
فیلدی است که موقتاً قفل است و `editable={false}` برای فیلدی که اصلاً قرار نبوده تایپ
شود. با `editable={false}` مقدارِ ref همان `<button>` تریگر است.

## روی موبایل

جایی که اشاره‌گر لمسی است، پیکر با باز شدن تقویم مکان‌نما را رها می‌کند تا کیبورد پیش
از جای‌گیری پنل بسته شود، و بعد از انتخاب تاریخ هم فوکوس را پس نمی‌گیرد. هر دو جلوی
این را می‌گیرند که کیبورد روی تقویم بیفتد — و بدتر، وسط لمس بسته شود، پنل را از زیر
انگشت جابه‌جا کند و لمس هدر برود.

پنل به‌جای `window.innerHeight` با visual viewport اندازه‌گیری می‌شود — که در iOS با
وجود کیبورد همچنان ارتفاع کامل را گزارش می‌کند — و در طول هر حرکتی که روی خودش شروع
شود بی‌حرکت می‌ماند.

زیر ۶۴۰ پیکسل تقویم به‌جای چسبیدن به تریگر به‌صورت **شیت پایین‌صفحه** نمایش داده
می‌شود — یعنی `mode="auto"`، که پیش‌فرضِ هر دو انتخابگر تاریخ و بازه است. پنلی که به
فیلدی نزدیک پایین صفحهٔ موبایل چسبیده باشد فقط می‌تواند بچرخد و کلمپ شود و در نهایت
به لبه فشرده می‌شود؛ انتخابگر بازه هم که پهن‌ترین پنل این کتابخانه است، از صفحه بیرون
می‌زد. با `mode="popover"` همه‌جا چسبیده می‌ماند و با `mode="sheet"` همیشه شیت است.

شیت تمام‌عرض است، صفحهٔ پشتش را تیره می‌کند و داخل خودش اسکرول می‌شود. درون آن اندازهٔ
روزها به هدف لمسی ۴۴ پیکسل می‌رسد، ماه‌های انتخابگر بازه به‌جای کنار هم روی هم می‌آیند
و میان‌برهایش به یک نوار افقی تبدیل می‌شوند. با `--doran-sheet-bg`،
`--doran-sheet-backdrop`، `--doran-sheet-radius`، `--doran-sheet-padding`،
`--doran-sheet-content-width` و `--doran-day-size-touch` تنظیمش کنید.

## نوع مقدار

`value`، `defaultValue`، `min` و `max` این‌ها را می‌پذیرند: `DoranDate`، `Date` نیتیو،
میلی‌ثانیهٔ epoch، یا رشته — جلالی یا میلادی، با ارقام لاتین یا فارسی.

```tsx
// onChange یک رشته می‌گیرد، با همان تایپ.
<DoranDatePicker valueFormat="YYYY-MM-DD" onChange={setQueryParam} />
```

| `valueFormat`       | مقداری که `onChange` می‌گیرد     |
| ------------------- | -------------------------------- |
| `'doran'` (پیش‌فرض) | `DoranDate`                      |
| `'date'`            | `Date` نیتیو                     |
| `'iso'`             | رشتهٔ ISO میلادی (UTC)           |
| هر رشتهٔ دیگر       | همان الگوی جلالی، با ارقام لاتین |

آرگومان دوم `onChange` همیشه `Date` میلادی است. خروجیِ الگو با ارقام لاتین است، چون
مقصدش query string یا API است نه صفحهٔ نمایش.

## فرم‌ها

پیکر ref خود را به input می‌دهد و `name`، `required`، `readOnly`، `editable`،
`invalid`، `onBlur` و `aria-describedby` را می‌پذیرد. پیکرِ نام‌دار از طریق یک input مخفی با مقدارِ
ماشین‌خوانِ لاتین ارسال می‌شود.

```tsx
<Controller
  control={control}
  name="checkIn"
  render={({ field, fieldState }) => (
    <DoranDatePicker {...field} invalid={Boolean(fieldState.error)} />
  )}
/>
```

`{...field}` مقادیر `value`، `onChange`، `onBlur`، `name` و `ref` را می‌دهد. اگر
می‌خواهید در فرم رشتهٔ ساده نگه دارید، `valueFormat` بدهید و از `register` استفاده کنید.

## استایل بخش‌ها

```tsx
<DoranDatePicker classNames={{ trigger: 'h-9', popover: 'shadow-xl' }} />
```

بخش‌ها: `root`، `trigger`، `input`، `icon`، `popover` و `calendar`؛ کلاس‌های شما با
کلاس‌های Doran ادغام می‌شوند. `portalContainer` پاپ‌اور را از `document.body` جابه‌جا
می‌کند — وقتی پیکر داخل دیالوگی با focus trap است، المنت همان دیالوگ را بدهید.

## ویجت روزها

زیر هر روز محتوای دلخواه بگذارید — نرخ بلیت، شمار صندلی، وضعیت ظرفیت.

| Prop            | Type                                                | توضیح                                                            |
| --------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| `dayContent`    | `(day: DoranDate, meta: DayMeta) => ReactNode`      | محتوای زیر عدد روز؛ باید غیرتعاملی باشد                          |
| `dayProps`      | `(day: DoranDate, meta: DayMeta) => DayPropsResult` | ویژگی‌هایی که روی دکمهٔ روز ادغام می‌شود — `className`، `data-*` |
| `dayData`       | `Record<string, DayDatum>`                          | داده‌های قابل‌سریال‌سازی با کلید جلالی `YYYY-M-D`                |
| `disabledDates` | `(day: DoranDate) => boolean`                       | بستن روزهای منفرد، جدا از `min`/`max`                            |

```tsx
import { DoranDatePicker, dayKey } from '@doranjs/react';

<DoranDatePicker
  dayContent={(day) => <span>{fares[dayKey(day)]}</span>}
  dayProps={(day) => ({
    'data-cheapest': isCheapest(day) || undefined,
    label: `${fares[dayKey(day)]} تومان`,
  })}
  disabledDates={(day) => soldOut(day)}
/>;
```

دو نکته برای دسترس‌پذیری. **`dayContent` باید غیرتعاملی باشد** — خودِ خانهٔ روز یک
`<button>` است، پس دکمه یا لینکِ تودرتو هم HTML نامعتبر است و هم مدل صفحه‌کلیدِ جدول را
می‌شکند؛ محتوای تعاملی را در اسلات بگذارید. و **آنچه را نمایش می‌دهید اعلام کنید** —
`aria-label` روز به‌جای افزودن، متن را جایگزین می‌کند، پس محتوای سفارشی تا وقتی `label`
از `dayProps` برنگردانید برای صفحه‌خوان نامرئی است. متنِ `dayData` خودکار استفاده می‌شود.

### dayData

تابع رندر از مرز HTML رد نمی‌شود، پس یک نگاشتِ قابل‌سریال‌سازی هم هست. چون از JSON عبور
می‌کند می‌تواند مستقیماً از پاسخ API بیاید و همان شکل در Vue، Svelte، Angular و HTML ساده
هم کار می‌کند.

```tsx
<DoranDatePicker
  dayData={{
    '1404-5-12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' },
    '1404-5-14': { disabled: true, disabledReason: 'ظرفیت تکمیل' },
  }}
/>
```

`DayDatum` این‌ها را می‌پذیرد: `text`، `tone`، `label`، `title`، `disabled` و
`disabledReason`. کلیدها جلالیِ `YYYY-M-D` هستند؛ شکل‌های صفرداده و با ارقام فارسی به
همان روز می‌رسند. اگر هر دو برای یک روز محتوا بدهند، `dayContent` برنده است.

`tone` به `data-tone` تبدیل می‌شود: `low`/`positive` و `high`/`negative` از پیش استایل
دارند و هر مقدار دیگری برای CSS خودتان عبور می‌کند.

### روزهای بسته

روزِ بسته به‌جای ویژگی `disabled` مقدار `aria-disabled` می‌گیرد، پس همچنان قابل فوکوس
می‌ماند و می‌تواند دلیلش را بگوید. پیمایش با کلیدهای جهت از شکافِ `min`/`max` — که ممکن
است دهه‌ها طول بکشد — می‌پرد، اما روی روزهای بستهٔ منفرد می‌ایستد تا `disabledReason`
شنیده شود.

## اسلات‌ها

نواحی `legend`، `aside` و `footer` محتوای شما را می‌پذیرند. برخلاف `dayContent`، محتوای
اسلات بیرون از جدول روزهاست، پس می‌تواند کاملاً تعاملی باشد.

```tsx
<DoranCalendar
  slots={{
    legend: <FareLegend />,
    aside: <FlexibleDatesPanel />,
    footer: <SelectedFareSummary />,
  }}
/>
```

`useDoranCalendar()` وضعیت و پیمایشِ تقویم را به آن محتوا می‌دهد — و همین است که اسلات را
از تزئین فراتر می‌برد:

```tsx
function JumpThreeMonths() {
  const { year, month, setMonth } = useDoranCalendar();
  return <button onClick={() => setMonth({ year, month: month + 3 })}>۳ ماه بعد</button>;
}
```

این‌ها را در اختیار می‌گذارد: `year`، `month`، `today`، `locale`، `selected`، `range`،
`isSelected`، `isDisabled`، `select`، `selectRange`، `clear`، `setMonth` و کمکی‌های
`goTo*`. فراخوانی بیرون از تقویم Doran خطا می‌دهد.

## تعطیلات رسمی ایران

```tsx
import { useHolidays } from '@doranjs/react/holidays';

const holidays = useHolidays();

<DoranDatePicker isHoliday={holidays.isHoliday} dayProps={holidays.dayProps} />;
```

یک خروجیِ subpath است، پس دادهٔ تعطیلات فقط وارد باندل‌هایی می‌شود که واردش کرده‌اند.
هر سال را هم یک‌بار ایندکس می‌کند — `getHolidaysOn()` در هر فراخوانی کل سال را دوباره
حساب می‌کند، کاری که یک جدول ماه در هر رندر ۴۲ بار انجام می‌داد.

`isHoliday` به‌طور پیش‌فرض فقط تعطیلات رسمی را می‌شمارد؛ برای مناسبت‌ها
`officialOnly: false` بدهید. تاریخ‌های قمریِ خارج از سال‌هایی که ایران رسماً اعلام کرده
حسابی محاسبه می‌شوند و ممکن است یک روز این‌طرف یا آن‌طرف باشند — آن‌ها `data-approximate`
دارند.

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

## انتخاب بازه با ورودی

`DoranRangeDatePicker` یک تریگر با دو فیلد است که هم تایپ می‌شوند و هم از جدول پر:

```tsx
<DoranRangeDatePicker value={range} onChange={setRange} numberOfMonths={2} presets />
```

ترتیب دو سر حفظ می‌شود — پایانِ قبل از شروع جابه‌جا می‌شود. `startName` و `endName`
فیلدهای مخفی با تاریخ لاتین برای ارسال فرم نیتیو می‌سازند. `DoranRangePicker` همان
نسخهٔ inline بدون تریگر است.

## انتخاب زمان

هر فیلد هم تایپ می‌شود و هم با فلش جابه‌جا، و هر واحد گام خودش را دارد که پیش‌فرض
همه `1` است:

```tsx
<DoranDatePicker withTime withSeconds hourCycle={12} minuteStep={15} />
```

| Prop          | پیش‌فرض | توضیح                                   |
| ------------- | ------- | --------------------------------------- |
| `hourStep`    | `1`     | یک فشار فلش چقدر ساعت را جابه‌جا می‌کند |
| `minuteStep`  | `1`     | …دقیقه                                  |
| `secondStep`  | `1`     | …ثانیه                                  |
| `withSeconds` | `false` | فیلد ثانیه اضافه می‌کند                 |
| `hourCycle`   | `24`    | با `12` کلید صبح/عصر از locale می‌آید   |
| `readOnly`    | —       | تایپ را می‌بندد، فلش‌ها کار می‌کنند     |

## نحوهٔ نمایش

```tsx
<DoranDatePicker mode="auto" />
```

`auto` زیر ۶۴۰ پیکسل به شیت پایینی می‌رود، `sheet` همیشه، و `popover` (پیش‌فرض) هرگز.
