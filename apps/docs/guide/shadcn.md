# shadcn/ui

یک انتخابگر تاریخ شمسی که از کامپوننت‌های **خودتان** ساخته می‌شود نصب کنید:

```bash
npx shadcn@latest add https://amiralibg.github.io/Doran/r/doran-date-picker.json
```

فایل `components/ui/doran-date-picker.tsx` را در پروژه‌تان می‌گذارد و اگر
`button`، `input` و `popover` را ندارید، آن‌ها را هم می‌آورد.

## چه چیزی می‌گیرید

کامپوننت مال شماست — مثل هر فایل دیگری در `components/ui` ویرایشش کنید. تمام ظاهر از
توکن‌های تم و پریمیتیوهای خودتان می‌آید؛ Doran فقط موتور تقویم را می‌دهد:

- `useCalendar` برای وضعیت ماه، انتخاب، و کران‌های `min`/`max`
- `buildMonthGrid` برای جدول ماه جلالی با شروع شنبه
- `navigateFocus` برای محاسبات کلیدهای جهت
- `parseJalali` تا `1402/5/12`، `1402-5-12` و `۱۴۰۲/۰۵/۱۲` همه پارس شوند

بدون استایل‌شیت Doran، بدون کلاس‌های `doran-*`، بدون چیزی که دورش تم بنویسید.

```tsx
import { DoranDatePicker } from '@/components/ui/doran-date-picker';

<DoranDatePicker value={value} onChange={setValue} />;
```

## دسترس‌پذیری

کامپوننتِ نصب‌شده بخش‌هایی را که به‌راحتی اشتباه می‌شوند نگه می‌دارد: یک
`role="grid"` با roving tabindex، کلیدهای جهت هماهنگ با جهت نوشتار، `aria-disabled`
روی روزهای بسته تا قابل دسترسی بمانند، و `aria-current="date"` روی امروز.

## زبان

locale محیطی را می‌خواند، پس `setDefaultLocale(enUS)` نام ماه‌ها، ارقام، برچسب‌ها **و**
جهت را عوض می‌کند — از جمله سمتی که فلش‌های ناوبری به آن اشاره می‌کنند.

```tsx
import { enUS, setDefaultLocale } from '@doranjs/core';

setDefaultLocale(enUS);
```

## کامپوننت‌های آمادهٔ Doran را ترجیح می‌دهید؟

اگر نمی‌خواهید فایل را خودتان نگه دارید، `@doranjs/react` همین انتخابگر را کامل
می‌دهد، همراه ویجت روزها، اسلات‌ها، انتخاب بازه و انتخاب زمان. به
[API ری‌اکت](/api/react) نگاه کنید.
