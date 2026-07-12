import { enUS, faIR, type Locale } from '@doranjs/core';
import { type ReactNode } from 'react';

export type Lang = 'fa' | 'en';

/** The Doran calendar locale that matches an example-app language. */
export function localeFor(lang: Lang): Locale {
  return lang === 'fa' ? faIR : enUS;
}

/** Natural reading direction for a language; direction follows language. */
export function dirFor(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'fa' ? 'rtl' : 'ltr';
}

type Dict = Record<string, ReactNode>;

const fa: Dict = {
  brandSub: 'نمونهٔ React',
  headerTitle: 'کاتالوگ کامپوننت‌ها',
  headerSubtitle:
    'هر کارت یک قابلیت یا حالت را به‌صورت زنده نشان می‌دهد. برای دیدن کدِ همان نمونه، روی «نمایش کد» بزنید.',

  navCalendar: 'تقویم — DoranCalendar',
  navDatePicker: 'انتخاب تاریخ — DoranDatePicker',
  navRangePicker: 'انتخاب بازه — DoranRangePicker',
  navAgenda: 'برنامه — DoranAgenda',
  navNlpInput: 'ورودی زبان طبیعی — DoranNlpInput',
  navTimePicker: 'انتخاب زمان — DoranTimePicker',
  navTheming: 'پوسته و تم',

  // Toolbar buttons (label reflects the action that will happen on click).
  themeToDark: '🌙 تیره',
  themeToLight: '☀️ روشن',
  langToEn: 'English',
  langToFa: 'فارسی',

  // Demo-card chrome.
  showCode: 'نمایش کد',
  hideCode: 'پنهان کردن کد',
  copy: 'کپی',
  copied: '✓ کپی شد',

  // ── <DoranCalendar> ────────────────────────────────────────────────
  calIntro: (
    <>
      تقویم ماهانهٔ کامل و راست‌چین، با پشتیبانی کامل از صفحه‌کلید (کلیدهای جهت‌نما، <kbd>Home</kbd>
      /<kbd>End</kbd>، <kbd>PageUp</kbd>/<kbd>PageDown</kbd> و <kbd>Enter</kbd>). هر کارت یک گزینه
      یا حالت را نشان می‌دهد؛ برای دیدن کدِ همان نمونه روی «نمایش کد» بزنید.
    </>
  ),
  calDefaultTitle: 'پیش‌فرض',
  calDefaultDesc: 'هدر کشویی برای ماه و سال، هفتهٔ شنبه‌محور، و حالت کنترل‌شده.',
  calSeparateTitle: 'هدر جداگانه',
  calSeparateDesc:
    'با headerMode=«separate» به‌جای پنل کشویی، از منوهای بومیِ ماه و سال استفاده می‌شود.',
  calTimeTitle: 'انتخاب زمان',
  calTimeDesc:
    'با withTime یک انتخابگر زمان اضافه می‌شود و زمانِ انتخاب‌شده روی مقدار نهایی اعمال می‌گردد.',
  calHolidaysTitle: 'تعطیلات رسمی',
  calHolidaysDesc:
    'با isHoliday روزهای تعطیل با نقطه و رنگ مشخص می‌شوند؛ این‌جا به دادهٔ تعطیلاتِ رسمیِ @doranjs/holidays وصل شده است.',
  calWeekendsTitle: 'آخر هفتهٔ سفارشی',
  calWeekendsDesc:
    'با weekends تعیین می‌کنید کدام روزها آخر هفته باشند (۰ = شنبه). پیش‌فرض فقط جمعه است.',
  calOutsideTitle: 'روزهای ماه‌های مجاور',
  calOutsideDesc:
    'با showOutsideDays خانه‌های ابتدا و انتهای جدول با روزهای ماه‌های مجاور پر می‌شوند.',
  calLocaleTitle: 'زبان تقویم (Locale)',
  calLocaleDesc:
    'با prop به‌نام locale نام‌ها، اعداد و دکمه‌های فوتر عوض می‌شوند؛ این‌جا enUS با اعداد لاتین و دکمه‌های «Today» و «Clear» نمایش داده می‌شود.',
  calHeadlessTitle: 'بدون‌سَر (Headless)',
  calHeadlessDesc:
    'ترکیب هوکِ useCalendar با کامپوننت نمایشیِ DoranMonthView برای کنترل کامل روی ظاهر و ناوبری.',

  // ── <DoranDatePicker> ──────────────────────────────────────────────
  dpIntro: 'ورودیِ تاریخ با پاپ‌اوورِ تقویم؛ سبک، دسترس‌پذیر و کاملاً قابل‌تنظیم.',
  dpDefaultTitle: 'پیش‌فرض',
  dpDefaultDesc:
    'با کلیک روی ورودی، تقویم باز می‌شود و تاریخ انتخاب‌شده در قالب پیش‌فرض نشان داده می‌شود.',
  dpTimeTitle: 'تاریخ و زمان',
  dpTimeDesc: 'با withTime علاوه بر تاریخ، زمان هم انتخاب می‌شود.',
  dpFormatTitle: 'قالب و متن راهنما',
  dpFormatDesc: 'با format قالبِ نمایش تاریخ و با placeholder متنِ راهنما را تعیین می‌کنید.',
  dpRangeTitle: 'حداقل/حداکثر و غیرفعال',
  dpRangeDesc: 'با min و max بازهٔ مجاز را محدود می‌کنید؛ با disabled کل ورودی غیرفعال می‌شود.',
  dpCustomizationTitle: 'اکشن‌ها و چیدمان',
  dpCustomizationDesc:
    'فوترِ مرتبِ امروز/پاک کردن، جای آیکن، تراز متن و عرض هماهنگِ ورودی و dropdown را یک‌جا تنظیم کنید.',

  // ── <DoranRangePicker> ─────────────────────────────────────────────
  rpIntro: 'انتخاب بازهٔ تاریخ با همان منطقِ تقویم؛ با میان‌برهای آماده و نمایش چندماهه.',
  rpDefaultTitle: 'پیش‌فرض',
  rpDefaultDesc: 'با کلیک روی روزِ شروع و سپس روزِ پایان، بازه انتخاب می‌شود.',
  rpPresetsTitle: 'میان‌برهای آماده',
  rpPresetsDesc:
    'با presets فهرستی از بازه‌های پرکاربرد (۷ روز اخیر، این ماه، …) بالای تقویم نمایش داده می‌شود.',
  rpMultiTitle: 'نمایش چندماهه',
  rpMultiDesc:
    'با numberOfMonths چند ماه کنار هم نشان داده می‌شود تا انتخابِ بازه‌های بلند ساده‌تر شود.',
  rpHolidaysTitle: 'تعطیلات و آخر هفته',
  rpHolidaysDesc: 'مثل تقویم، با isHoliday و weekends روزهای تعطیل و آخر هفته مشخص می‌شوند.',

  // ── <DoranAgenda> ──────────────────────────────────────────────────
  agIntro: 'نمای فهرستیِ روزها همراه با رویدادهای هر روز؛ مناسب برای برنامه و تقویمِ کاری.',
  agDefaultTitle: 'هفتهٔ جاری',
  agDefaultDesc: 'با start و events، یک هفته به‌همراه رویدادهای آن نمایش داده می‌شود.',
  agDaysTitle: 'تعداد روزِ دلخواه',
  agDaysDesc: 'با days تعداد روزهای نمایش‌داده‌شده را تعیین می‌کنید (مثلاً سه روز).',
  agRenderTitle: 'نمایشِ سفارشیِ رویداد',
  agRenderDesc: 'با renderEvent ظاهرِ هر رویداد را خودتان طراحی می‌کنید.',

  // ── <DoranNlpInput> ────────────────────────────────────────────────
  nlpIntro:
    'ورودیِ متنِ آزاد که تاریخ و زمان را از زبانِ طبیعیِ فارسی تشخیص می‌دهد (مثلاً «پنجشنبهٔ بعد ساعت ۵»).',
  nlpDefaultTitle: 'پیش‌فرض',
  nlpDefaultDesc: 'هم‌زمان با تایپ، پیش‌نمایشِ تاریخِ تشخیص‌داده‌شده زیر ورودی نشان داده می‌شود.',
  nlpSuggestTitle: 'پیشنهادها',
  nlpSuggestDesc: 'با showSuggestions فهرستی از تکمیل‌های پیشنهادی زیر ورودی ظاهر می‌شود.',
  nlpResolveTitle: 'دریافت نتیجه',
  nlpResolveDesc:
    'با onResolve به نتیجهٔ تشخیص دسترسی دارید و می‌توانید آن را در برنامه به‌کار ببرید.',

  // ── <DoranTimePicker> ──────────────────────────────────────────────
  tpIntro: 'انتخابگرِ ساعت و دقیقه، با پلهٔ دقیقهٔ دلخواه و پشتیبانی از صفحه‌کلید.',
  tpDefaultTitle: 'پیش‌فرض',
  tpDefaultDesc: 'انتخابِ ساعت و دقیقه با کلیدهای بالا/پایین یا کلیدهای جهت‌نما.',
  tpStepTitle: 'پلهٔ دقیقه',
  tpStepDesc: 'با minuteStep گامِ تغییرِ دقیقه را تعیین می‌کنید (مثلاً ۱۵ دقیقه‌ای).',

  // ── Theming ────────────────────────────────────────────────────────
  thIntro:
    'همه‌چیز با متغیّرهای CSS تنظیم می‌شود. کل ظاهر را با چند متغیّر عوض کنید — بدون بازنویسیِ کامپوننت — و تمِ روشن/تیره را با ThemeProvider مدیریت کنید.',
  thTokensTitle: 'تمِ سفارشی با متغیّرهای CSS',
  thTokensDesc:
    'فقط با تعریفِ چند متغیّرِ --doran-* روی یک ظرف، همان تقویم ظاهری کاملاً متفاوت پیدا می‌کند.',
  thButtonTitle: 'دکمه (Button)',
  thButtonDesc: 'دکمهٔ پایهٔ سیستمِ طراحی با حالت‌های مختلف: primary، outline و ghost.',
  thModeTitle: 'تمِ روشن و تیره',
  thModeDesc:
    'ThemeProvider تمِ روشن/تیره و جهتِ متن را مدیریت می‌کند؛ از دکمهٔ بالای صفحه برای جابه‌جایی استفاده کنید.',
};

const en: Dict = {
  brandSub: 'React example',
  headerTitle: 'Component catalog',
  headerSubtitle:
    'Each card shows one option or state live. Click “Show code” to see the exact code behind it.',

  navCalendar: 'Calendar — DoranCalendar',
  navDatePicker: 'Date picker — DoranDatePicker',
  navRangePicker: 'Range picker — DoranRangePicker',
  navAgenda: 'Agenda — DoranAgenda',
  navNlpInput: 'Natural-language input — DoranNlpInput',
  navTimePicker: 'Time picker — DoranTimePicker',
  navTheming: 'Theming',

  themeToDark: '🌙 Dark',
  themeToLight: '☀️ Light',
  langToEn: 'English',
  langToFa: 'فارسی',

  showCode: 'Show code',
  hideCode: 'Hide code',
  copy: 'Copy',
  copied: '✓ Copied',

  // ── <DoranCalendar> ────────────────────────────────────────────────
  calIntro: (
    <>
      A complete, RTL-first month calendar with full keyboard support (arrow keys, <kbd>Home</kbd>/
      <kbd>End</kbd>, <kbd>PageUp</kbd>/<kbd>PageDown</kbd> and <kbd>Enter</kbd>). Each card shows
      one option or state; click “Show code” to view its source.
    </>
  ),
  calDefaultTitle: 'Default',
  calDefaultDesc: 'Dropdown month/year header, Saturday-first weeks, controlled value.',
  calSeparateTitle: 'Separate header',
  calSeparateDesc:
    'With headerMode="separate", native month and year menus replace the inline dropdown panels.',
  calTimeTitle: 'With time',
  calTimeDesc: 'withTime adds a time picker and carries the time-of-day on the selected value.',
  calHolidaysTitle: 'Holidays',
  calHolidaysDesc:
    'isHoliday marks days with a dot and the holiday color — here wired to the official-holiday data from @doranjs/holidays.',
  calWeekendsTitle: 'Custom weekend',
  calWeekendsDesc:
    'weekends chooses which weekday indices count as the weekend (0 = Saturday). The default is Friday only.',
  calOutsideTitle: 'Adjacent-month days',
  calOutsideDesc:
    'showOutsideDays fills the leading and trailing cells with days from the neighbouring months.',
  calLocaleTitle: 'Calendar locale',
  calLocaleDesc:
    'The locale prop switches month and weekday names, digits, and footer labels — here enUS shows Latin digits with Today and Clear.',
  calHeadlessTitle: 'Headless',
  calHeadlessDesc:
    'Compose the headless useCalendar hook with the presentational DoranMonthView for full control over markup and navigation.',

  // ── <DoranDatePicker> ──────────────────────────────────────────────
  dpIntro: 'A date input with a calendar popover — light, accessible and fully configurable.',
  dpDefaultTitle: 'Default',
  dpDefaultDesc:
    'Clicking the input opens the calendar; the chosen date shows in the default format.',
  dpTimeTitle: 'Date and time',
  dpTimeDesc: 'withTime lets the user pick a time of day alongside the date.',
  dpFormatTitle: 'Format and placeholder',
  dpFormatDesc: 'format controls how the date is displayed; placeholder sets the empty-state hint.',
  dpRangeTitle: 'Min/max and disabled',
  dpRangeDesc: 'min and max bound the selectable range; disabled turns the whole input off.',
  dpCustomizationTitle: 'Actions and layout',
  dpCustomizationDesc:
    'Configure ordered Today/Clear actions, icon position, text alignment, and matching input/dropdown widths together.',

  // ── <DoranRangePicker> ─────────────────────────────────────────────
  rpIntro:
    'Pick a date range with the same calendar logic — with ready-made shortcuts and multi-month view.',
  rpDefaultTitle: 'Default',
  rpDefaultDesc: 'Click the start day, then the end day, to select a range.',
  rpPresetsTitle: 'Preset shortcuts',
  rpPresetsDesc:
    'presets shows a list of common ranges (last 7 days, this month, …) above the calendar.',
  rpMultiTitle: 'Multiple months',
  rpMultiDesc:
    'numberOfMonths shows several months side by side, easing the selection of long ranges.',
  rpHolidaysTitle: 'Holidays and weekend',
  rpHolidaysDesc: 'Like the calendar, isHoliday and weekends mark holiday and weekend days.',

  // ── <DoranAgenda> ──────────────────────────────────────────────────
  agIntro: 'A list view of days with each day’s events — great for schedules and work calendars.',
  agDefaultTitle: 'Current week',
  agDefaultDesc: 'start and events render one week together with its events.',
  agDaysTitle: 'Custom day count',
  agDaysDesc: 'days sets how many days are shown (three, for example).',
  agRenderTitle: 'Custom event rendering',
  agRenderDesc: 'renderEvent lets you design the look of each event yourself.',

  // ── <DoranNlpInput> ────────────────────────────────────────────────
  nlpIntro:
    'A free-text input that recognises dates and times from natural Persian (e.g. “پنجشنبهٔ بعد ساعت ۵”).',
  nlpDefaultTitle: 'Default',
  nlpDefaultDesc: 'As you type, a preview of the recognised date appears beneath the input.',
  nlpSuggestTitle: 'Suggestions',
  nlpSuggestDesc: 'showSuggestions surfaces a list of completion suggestions under the input.',
  nlpResolveTitle: 'Reading the result',
  nlpResolveDesc: 'onResolve gives you the parsed result so you can use it in your app.',

  // ── <DoranTimePicker> ──────────────────────────────────────────────
  tpIntro: 'An hour/minute picker with a configurable minute step and keyboard support.',
  tpDefaultTitle: 'Default',
  tpDefaultDesc: 'Pick hour and minute with the up/down buttons or the arrow keys.',
  tpStepTitle: 'Minute step',
  tpStepDesc: 'minuteStep sets the minute increment (15-minute steps, for example).',

  // ── Theming ────────────────────────────────────────────────────────
  thIntro:
    'Everything is driven by CSS variables. Restyle the whole UI with a handful of variables — no component overrides — and manage light/dark with ThemeProvider.',
  thTokensTitle: 'Custom theme via CSS variables',
  thTokensDesc:
    'Defining a few --doran-* variables on a wrapper gives the same calendar a completely different look.',
  thButtonTitle: 'Button',
  thButtonDesc: 'The design-system’s base button across its variants: primary, outline and ghost.',
  thModeTitle: 'Light and dark',
  thModeDesc:
    'ThemeProvider manages the light/dark theme and text direction; use the button at the top to switch.',
};

export const STRINGS: Record<Lang, Dict> = { fa, en };
