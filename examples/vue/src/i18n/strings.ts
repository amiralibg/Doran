import { enUS, faIR, type Locale } from '@doranjs/core';

export type Lang = 'fa' | 'en';

/** The Doran calendar locale that matches an example-app language. */
export function localeFor(lang: Lang): Locale {
  return lang === 'fa' ? faIR : enUS;
}

/** Natural reading direction for a language; direction follows language. */
export function dirFor(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'fa' ? 'rtl' : 'ltr';
}

type Dict = Record<string, string>;

const fa: Dict = {
  brandSub: 'نمونهٔ Vue',
  headerTitle: 'کاتالوگ کامپوننت‌ها',
  headerSubtitle:
    'هر کارت یک قابلیت یا حالت را به‌صورت زنده نشان می‌دهد. برای دیدن کدِ همان نمونه، روی «نمایش کد» بزنید.',

  navCalendar: 'تقویم — DoranCalendar',
  navDatePicker: 'انتخاب تاریخ — DoranDatePicker',
  navRangePicker: 'انتخاب بازه — DoranRangePicker',
  navAgenda: 'برنامه — DoranAgenda',
  navNlpInput: 'ورودی زبان طبیعی — DoranNlpInput',
  navTheming: 'پوسته و تم',

  themeToDark: '🌙 تیره',
  themeToLight: '☀️ روشن',
  langToEn: 'English',
  langToFa: 'فارسی',

  showCode: 'نمایش کد',
  hideCode: 'پنهان کردن کد',
  copy: 'کپی',
  copied: '✓ کپی شد',

  // ── <DoranCalendar> ────────────────────────────────────────────────
  calIntro:
    'تقویم ماهانهٔ کامل و راست‌چین با پشتیبانی کامل از صفحه‌کلید (کلیدهای جهت‌نما، Home/End، PageUp/PageDown و Enter). هر کارت یک گزینه یا حالت را نشان می‌دهد؛ برای دیدن کدِ همان نمونه روی «نمایش کد» بزنید.',
  calDefaultTitle: 'پیش‌فرض',
  calDefaultDesc: 'هدر کشویی برای ماه و سال، هفتهٔ شنبه‌محور، و v-model کنترل‌شده.',
  calSeparateTitle: 'هدر جداگانه',
  calSeparateDesc:
    'با header-mode=«separate» به‌جای پنل کشویی، از منوهای بومیِ ماه و سال استفاده می‌شود.',
  calTimeTitle: 'انتخاب زمان',
  calTimeDesc:
    'با with-time یک انتخابگر زمان اضافه می‌شود و زمانِ انتخاب‌شده روی مقدار نهایی اعمال می‌گردد.',
  calHolidaysTitle: 'تعطیلات رسمی',
  calHolidaysDesc:
    'با show-holidays روزهای تعطیلِ رسمی با نقطه و رنگ مشخص می‌شوند؛ داده از @doranjs/holidays می‌آید.',
  calWeekendsTitle: 'آخر هفتهٔ سفارشی',
  calWeekendsDesc:
    'با weekends تعیین می‌کنید کدام روزها آخر هفته باشند (۰ = شنبه). پیش‌فرض فقط جمعه است.',
  calLocaleTitle: 'زبان تقویم (Locale)',
  calLocaleDesc:
    'با attributeِ locale نام‌ها، اعداد و دکمه‌های فوتر عوض می‌شوند؛ این‌جا locale انگلیسی اعداد لاتین و دکمه‌های «Today» و «Clear» را نشان می‌دهد.',
  calHeadlessTitle: 'بدون‌سَر (Headless)',
  calHeadlessDesc:
    'با composableِ useCalendarGrid گریدِ خودتان را بسازید — همان منطقِ ناوبریِ مشترک، بدون کامپوننتِ آماده.',

  // ── <DoranDatePicker> ──────────────────────────────────────────────
  dpIntro: 'ورودیِ تاریخ با پاپ‌اوورِ تقویم؛ سبک، دسترس‌پذیر و کاملاً قابل‌تنظیم.',
  dpDefaultTitle: 'پیش‌فرض',
  dpDefaultDesc:
    'با کلیک روی ورودی، تقویم باز می‌شود و تاریخِ انتخاب‌شده در قالبِ پیش‌فرض نشان داده می‌شود.',
  dpTimeTitle: 'تاریخ و زمان',
  dpTimeDesc: 'با with-time علاوه بر تاریخ، زمان هم انتخاب می‌شود.',
  dpFormatTitle: 'قالب و متن راهنما',
  dpFormatDesc: 'با format قالبِ نمایشِ تاریخ و با placeholder متنِ راهنما را تعیین می‌کنید.',
  dpCustomizationTitle: 'اکشن‌ها و چیدمان',
  dpCustomizationDesc:
    'فوترِ مرتبِ امروز/پاک کردن، جای آیکن، تراز متن و عرض هماهنگِ ورودی و dropdown را یک‌جا تنظیم کنید.',

  // ── <DoranRangePicker> ─────────────────────────────────────────────
  rpIntro: 'انتخابِ بازهٔ تاریخ با همان منطقِ تقویم؛ با میان‌برهای آماده و نمایشِ چندماهه.',
  rpTriggerTitle: 'با ورودی — DoranRangeDatePicker',
  rpTriggerDesc: 'یک تریگر با دو فیلد که هم تایپ می‌شوند و هم از جدول پر. ترتیب دو سر حفظ می‌شود.',
  wgEventsTitle: 'ویجت زیر روزها',
  wgEventsDesc:
    'با dayData — یک آبجکت سادهٔ قابل‌سریال‌سازی — و اسلات legend، دقیقاً مثل نسخهٔ ری‌اکت.',
  rpDefaultTitle: 'پیش‌فرض',
  rpDefaultDesc: 'با کلیک روی روزِ شروع و سپس روزِ پایان، بازه انتخاب می‌شود.',
  rpPresetsTitle: 'میان‌برهای آماده',
  rpPresetsDesc:
    'با presets فهرستی از بازه‌های پرکاربرد (۷ روز اخیر، این ماه، …) بالای تقویم نمایش داده می‌شود.',
  rpMultiTitle: 'نمایش چندماهه',
  rpMultiDesc: 'با months چند ماه کنار هم نشان داده می‌شود تا انتخابِ بازه‌های بلند ساده‌تر شود.',
  rpHolidaysTitle: 'تعطیلات و آخر هفته',
  rpHolidaysDesc: 'با show-holidays و weekends روزهای تعطیل و آخر هفته مشخص می‌شوند.',

  // ── <DoranAgenda> ──────────────────────────────────────────────────
  agIntro: 'نمای فهرستیِ روزها همراه با رویدادهای هر روز؛ مناسب برای برنامه و تقویمِ کاری.',
  agDefaultTitle: 'هفتهٔ جاری',
  agDefaultDesc: 'با start و events یک هفته به‌همراه رویدادهای آن نمایش داده می‌شود.',
  agDaysTitle: 'تعداد روزِ دلخواه',
  agDaysDesc: 'با days تعداد روزهای نمایش‌داده‌شده را تعیین می‌کنید (مثلاً سه روز).',
  agRenderTitle: 'نمایشِ سفارشیِ رویداد',
  agRenderDesc: 'با renderEvent ظاهرِ هر رویداد را خودتان طراحی می‌کنید (خروجی، رشتهٔ HTML).',

  // ── <DoranNlpInput> ────────────────────────────────────────────────
  nlpIntro:
    'ورودیِ متنِ آزاد که تاریخ و زمان را از زبانِ طبیعیِ فارسی تشخیص می‌دهد (مثلاً «پنجشنبهٔ بعد ساعت ۵»).',
  nlpDefaultTitle: 'پیش‌فرض',
  nlpDefaultDesc: 'هم‌زمان با تایپ، پیش‌نمایشِ تاریخِ تشخیص‌داده‌شده زیر ورودی نشان داده می‌شود.',
  nlpResolveTitle: 'دریافت نتیجه',
  nlpResolveDesc:
    'با رویدادِ resolve به نتیجهٔ تشخیص دسترسی دارید و می‌توانید آن را در برنامه به‌کار ببرید.',

  // ── Theming ────────────────────────────────────────────────────────
  thIntro:
    'همه‌چیز با متغیّرهای CSS تنظیم می‌شود. کل ظاهر را با چند متغیّر عوض کنید — بدون بازنویسیِ کامپوننت. تمِ روشن/تیره هم با attributeِ data-doran-theme مدیریت می‌شود (دکمهٔ بالای صفحه).',
  thTokensTitle: 'تمِ سفارشی با متغیّرهای CSS',
  thTokensDesc:
    'فقط با تعریفِ چند متغیّرِ --doran-* روی یک ظرف، همان تقویم ظاهری کاملاً متفاوت پیدا می‌کند.',
};

const en: Dict = {
  brandSub: 'Vue example',
  headerTitle: 'Component catalog',
  headerSubtitle:
    'Each card shows one option or state live. Click “Show code” to see the exact code behind it.',

  navCalendar: 'Calendar — DoranCalendar',
  navDatePicker: 'Date picker — DoranDatePicker',
  navRangePicker: 'Range picker — DoranRangePicker',
  navAgenda: 'Agenda — DoranAgenda',
  navNlpInput: 'Natural-language input — DoranNlpInput',
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
  calIntro:
    'A complete, RTL-first month calendar with full keyboard support (arrow keys, Home/End, PageUp/PageDown and Enter). Each card shows one option or state; click “Show code” to view its source.',
  calDefaultTitle: 'Default',
  calDefaultDesc: 'Dropdown month/year header, Saturday-first weeks, controlled v-model.',
  calSeparateTitle: 'Separate header',
  calSeparateDesc:
    'With header-mode="separate", native month and year menus replace the inline dropdown panels.',
  calTimeTitle: 'With time',
  calTimeDesc: 'with-time adds a time picker and carries the time-of-day on the selected value.',
  calHolidaysTitle: 'Holidays',
  calHolidaysDesc:
    'show-holidays marks official-holiday days with a dot and the holiday color — data from @doranjs/holidays.',
  calWeekendsTitle: 'Custom weekend',
  calWeekendsDesc:
    'weekends chooses which weekday indices count as the weekend (0 = Saturday). The default is Friday only.',
  calLocaleTitle: 'Calendar locale',
  calLocaleDesc:
    'The locale attribute switches month and weekday names, digits, and footer labels — here English uses Latin digits with Today and Clear.',
  calHeadlessTitle: 'Headless',
  calHeadlessDesc:
    'Build your own grid with the useCalendarGrid composable — the same shared navigation logic, no ready-made component.',

  // ── <DoranDatePicker> ──────────────────────────────────────────────
  dpIntro: 'A date input with a calendar popover — light, accessible and fully configurable.',
  dpDefaultTitle: 'Default',
  dpDefaultDesc:
    'Clicking the input opens the calendar; the chosen date shows in the default format.',
  dpTimeTitle: 'Date and time',
  dpTimeDesc: 'with-time lets the user pick a time of day alongside the date.',
  dpFormatTitle: 'Format and placeholder',
  dpFormatDesc: 'format controls how the date is displayed; placeholder sets the empty-state hint.',
  dpCustomizationTitle: 'Actions and layout',
  dpCustomizationDesc:
    'Configure ordered Today/Clear actions, icon position, text alignment, and matching input/dropdown widths together.',

  // ── <DoranRangePicker> ─────────────────────────────────────────────
  rpIntro:
    'Pick a date range with the same calendar logic — with ready-made shortcuts and multi-month view.',
  rpTriggerTitle: 'With an input — DoranRangeDatePicker',
  rpTriggerDesc:
    'One trigger holding two fields, either typable or fillable from the grid. The ends are kept in order.',
  wgEventsTitle: 'Day widgets',
  wgEventsDesc:
    'Via dayData — a plain serializable object — and the legend slot, exactly as in the React build.',
  rpDefaultTitle: 'Default',
  rpDefaultDesc: 'Click the start day, then the end day, to select a range.',
  rpPresetsTitle: 'Preset shortcuts',
  rpPresetsDesc:
    'presets shows a list of common ranges (last 7 days, this month, …) above the calendar.',
  rpMultiTitle: 'Multiple months',
  rpMultiDesc: 'months shows several months side by side, easing the selection of long ranges.',
  rpHolidaysTitle: 'Holidays and weekend',
  rpHolidaysDesc: 'show-holidays and weekends mark holiday and weekend days.',

  // ── <DoranAgenda> ──────────────────────────────────────────────────
  agIntro: 'A list view of days with each day’s events — great for schedules and work calendars.',
  agDefaultTitle: 'Current week',
  agDefaultDesc: 'start and events render one week together with its events.',
  agDaysTitle: 'Custom day count',
  agDaysDesc: 'days sets how many days are shown (three, for example).',
  agRenderTitle: 'Custom event rendering',
  agRenderDesc: 'renderEvent lets you design each event yourself (it returns an HTML string).',

  // ── <DoranNlpInput> ────────────────────────────────────────────────
  nlpIntro:
    'A free-text input that recognises dates and times from natural Persian (e.g. “پنجشنبهٔ بعد ساعت ۵”).',
  nlpDefaultTitle: 'Default',
  nlpDefaultDesc: 'As you type, a preview of the recognised date appears beneath the input.',
  nlpResolveTitle: 'Reading the result',
  nlpResolveDesc: 'The resolve event gives you the parsed result so you can use it in your app.',

  // ── Theming ────────────────────────────────────────────────────────
  thIntro:
    'Everything is driven by CSS variables. Restyle the whole UI with a handful of variables — no component overrides. Light/dark is managed via the data-doran-theme attribute (the button at the top).',
  thTokensTitle: 'Custom theme via CSS variables',
  thTokensDesc:
    'Defining a few --doran-* variables on a wrapper gives the same calendar a completely different look.',
};

export const STRINGS: Record<Lang, Dict> = { fa, en };
