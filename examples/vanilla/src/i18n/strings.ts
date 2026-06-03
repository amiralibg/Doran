export type Lang = 'fa' | 'en';

/** Plain strings for textContent; intros may contain HTML (set via innerHTML). */
type Dict = Record<string, string>;

const fa: Dict = {
  brandSub: 'نمونهٔ وب‌کامپوننت',
  headerTitle: 'کاتالوگ وب‌کامپوننت‌ها',
  headerSubtitle:
    'وب‌کامپوننت‌های فریم‌ورک‌مستقل، در HTML خالص. هر کارت یک قابلیت یا حالت را به‌صورت زنده نشان می‌دهد؛ برای دیدن کدِ همان نمونه روی «نمایش کد» بزنید.',

  navCalendar: 'تقویم — doran-calendar',
  navDatePicker: 'انتخاب تاریخ — doran-datepicker',
  navRangePicker: 'انتخاب بازه — doran-rangepicker',
  navAgenda: 'برنامه — doran-agenda',
  navNlpInput: 'ورودی زبان طبیعی — doran-nlp-input',
  navTheming: 'پوسته و تم',

  themeToDark: '🌙 تیره',
  themeToLight: '☀️ روشن',
  langToEn: 'English',
  langToFa: 'فارسی',

  showCode: 'نمایش کد',
  hideCode: 'پنهان کردن کد',
  copy: 'کپی',
  copied: '✓ کپی شد',

  // ── <doran-calendar> ───────────────────────────────────────────────
  calIntro:
    'تقویم ماهانهٔ کامل و راست‌چین، با پشتیبانی کامل از صفحه‌کلید (کلیدهای جهت‌نما، <kbd>Home</kbd>/<kbd>End</kbd>، <kbd>PageUp</kbd>/<kbd>PageDown</kbd> و <kbd>Enter</kbd>). گزینه‌ها با ویژگی‌های (attribute) HTML تنظیم می‌شوند.',
  calDefaultTitle: 'پیش‌فرض',
  calDefaultDesc: 'هدر کشویی ماه/سال؛ رویداد change مقدار انتخاب‌شده را می‌دهد.',
  calSeparateTitle: 'هدر جداگانه',
  calSeparateDesc: 'با header-mode="separate" به‌جای پنل کشویی از منوهای بومی استفاده می‌شود.',
  calTimeTitle: 'انتخاب زمان',
  calTimeDesc: 'با ویژگی with-time یک انتخابگر زمان هم اضافه می‌شود.',
  calHolidaysTitle: 'تعطیلات رسمی',
  calHolidaysDesc: 'با ویژگی show-holidays روزهای تعطیلِ رسمی با نقطه و رنگ مشخص می‌شوند.',
  calWeekendsTitle: 'آخر هفتهٔ سفارشی',
  calWeekendsDesc: 'با weekends="5,6" تعیین می‌کنید کدام روزها آخر هفته باشند (۰ = شنبه).',
  calFooterTitle: 'بدون فوتر و بازهٔ سال',
  calFooterDesc: 'با hide-footer دکمهٔ «امروز» حذف و با year-span دامنهٔ سال‌ها تنظیم می‌شود.',
  calLocaleTitle: 'زبان تقویم (Locale)',
  calLocaleDesc: 'با locale="en" تقویم انگلیسی با اعداد لاتین نمایش داده می‌شود.',

  // ── <doran-datepicker> ─────────────────────────────────────────────
  dpIntro: 'ورودیِ تاریخ با پاپ‌اوورِ تقویم؛ با کلیک بیرون یا Escape بسته می‌شود.',
  dpDefaultTitle: 'پیش‌فرض',
  dpDefaultDesc: 'با کلیک روی ورودی تقویم باز می‌شود؛ رویداد change تاریخ را می‌دهد.',
  dpTimeTitle: 'تاریخ و زمان',
  dpTimeDesc: 'با with-time علاوه بر تاریخ، زمان هم انتخاب می‌شود.',
  dpFormatTitle: 'قالب و متن راهنما',
  dpFormatDesc: 'با format قالبِ نمایش و با placeholder متنِ راهنما را تعیین می‌کنید.',
  dpHolidaysTitle: 'تعطیلات',
  dpHolidaysDesc: 'ویژگی show-holidays به تقویمِ داخلِ پاپ‌اوور هم منتقل می‌شود.',

  // ── <doran-rangepicker> ────────────────────────────────────────────
  rpIntro: 'انتخاب بازهٔ تاریخ با همان منطقِ تقویم؛ با میان‌برهای آماده و نمایش چندماهه.',
  rpDefaultTitle: 'پیش‌فرض',
  rpDefaultDesc: 'با کلیک روی روزِ شروع و سپس روزِ پایان، بازه انتخاب می‌شود.',
  rpPresetsTitle: 'میان‌برهای آماده',
  rpPresetsDesc: 'با ویژگی presets فهرستی از بازه‌های پرکاربرد بالای تقویم نمایش داده می‌شود.',
  rpMultiTitle: 'نمایش چندماهه',
  rpMultiDesc: 'با months="2" چند ماه کنار هم نشان داده می‌شود.',
  rpHolidaysTitle: 'تعطیلات و آخر هفته',
  rpHolidaysDesc: 'با show-holidays و weekends روزهای تعطیل و آخر هفته مشخص می‌شوند.',

  // ── <doran-agenda> ─────────────────────────────────────────────────
  agIntro: 'نمای فهرستیِ روزها همراه با رویدادهای هر روز؛ رویدادها با ویژگیِ events تنظیم می‌شوند.',
  agDefaultTitle: 'هفتهٔ جاری',
  agDefaultDesc: 'با start و events یک هفته به‌همراه رویدادهای آن نمایش داده می‌شود.',
  agDaysTitle: 'تعداد روزِ دلخواه',
  agDaysDesc: 'با days="3" تعداد روزهای نمایش‌داده‌شده را تعیین می‌کنید.',
  agRenderTitle: 'نمایشِ سفارشیِ رویداد',
  agRenderDesc:
    'با ویژگیِ renderEvent (که رشتهٔ HTML برمی‌گرداند) ظاهرِ هر رویداد را خودتان می‌سازید.',

  // ── <doran-nlp-input> ──────────────────────────────────────────────
  nlpIntro:
    'ورودیِ متنِ آزاد که تاریخ و زمان را از زبانِ طبیعیِ فارسی تشخیص می‌دهد (مثلاً «جمعه ساعت ۷ شب»).',
  nlpDefaultTitle: 'پیش‌فرض',
  nlpDefaultDesc: 'هم‌زمان با تایپ، پیش‌نمایشِ تاریخِ تشخیص‌داده‌شده زیر ورودی نشان داده می‌شود.',
  nlpSuggestTitle: 'پیشنهادها',
  nlpSuggestDesc: 'با show-suggestions فهرستی از تکمیل‌های پیشنهادی زیر ورودی ظاهر می‌شود.',
  nlpResolveTitle: 'دریافت نتیجه',
  nlpResolveDesc: 'با گوش‌دادن به رویداد resolve به نتیجهٔ تشخیص دسترسی دارید.',

  // ── Theming ────────────────────────────────────────────────────────
  thIntro:
    'همه‌چیز با متغیّرهای CSS تنظیم می‌شود. کل ظاهر را با چند متغیّر --doran-* عوض کنید و تمِ روشن/تیره را با ویژگیِ data-doran-theme روی ریشهٔ صفحه مدیریت کنید.',
  thTokensTitle: 'تمِ سفارشی با متغیّرهای CSS',
  thTokensDesc: 'با تعریفِ چند متغیّرِ --doran-* روی یک ظرف، همان تقویم ظاهری متفاوت پیدا می‌کند.',
  thModeTitle: 'تمِ تیرهٔ محدودشده',
  thModeDesc:
    'تمِ تیره فقط مجموعه‌ای از متغیّرها زیر [data-doran-theme="dark"] است؛ این ویژگی را روی هر عنصری بگذارید تا تمِ تیره به همان محدوده اعمال شود.',
};

const en: Dict = {
  brandSub: 'Web Components example',
  headerTitle: 'Web Components catalog',
  headerSubtitle:
    'Framework-agnostic web components in plain HTML. Each card shows one option or state live; click “Show code” to see the exact code behind it.',

  navCalendar: 'Calendar — doran-calendar',
  navDatePicker: 'Date picker — doran-datepicker',
  navRangePicker: 'Range picker — doran-rangepicker',
  navAgenda: 'Agenda — doran-agenda',
  navNlpInput: 'Natural-language input — doran-nlp-input',
  navTheming: 'Theming',

  themeToDark: '🌙 Dark',
  themeToLight: '☀️ Light',
  langToEn: 'English',
  langToFa: 'فارسی',

  showCode: 'Show code',
  hideCode: 'Hide code',
  copy: 'Copy',
  copied: '✓ Copied',

  // ── <doran-calendar> ───────────────────────────────────────────────
  calIntro:
    'A complete, RTL-first month calendar with full keyboard support (arrow keys, <kbd>Home</kbd>/<kbd>End</kbd>, <kbd>PageUp</kbd>/<kbd>PageDown</kbd> and <kbd>Enter</kbd>). Options are set with HTML attributes.',
  calDefaultTitle: 'Default',
  calDefaultDesc: 'Dropdown month/year header; the change event reports the selected value.',
  calSeparateTitle: 'Separate header',
  calSeparateDesc: 'header-mode="separate" swaps the dropdown panels for native menus.',
  calTimeTitle: 'With time',
  calTimeDesc: 'The with-time attribute adds a time picker.',
  calHolidaysTitle: 'Holidays',
  calHolidaysDesc: 'The show-holidays attribute marks official holidays with a dot and color.',
  calWeekendsTitle: 'Custom weekend',
  calWeekendsDesc: 'weekends="5,6" chooses which weekday indices are the weekend (0 = Saturday).',
  calFooterTitle: 'No footer & year span',
  calFooterDesc: 'hide-footer drops the “today” button; year-span sets the year range.',
  calLocaleTitle: 'Calendar locale',
  calLocaleDesc: 'locale="en" renders the English calendar with Latin digits.',

  // ── <doran-datepicker> ─────────────────────────────────────────────
  dpIntro: 'A date input with a calendar popover that closes on outside-click or Escape.',
  dpDefaultTitle: 'Default',
  dpDefaultDesc: 'Clicking the input opens the calendar; the change event reports the date.',
  dpTimeTitle: 'Date and time',
  dpTimeDesc: 'with-time lets the user pick a time of day alongside the date.',
  dpFormatTitle: 'Format and placeholder',
  dpFormatDesc: 'format controls the display; placeholder sets the empty-state hint.',
  dpHolidaysTitle: 'Holidays',
  dpHolidaysDesc: 'The show-holidays attribute is forwarded to the popover calendar.',

  // ── <doran-rangepicker> ────────────────────────────────────────────
  rpIntro:
    'Pick a date range with the same calendar logic — with ready-made shortcuts and multi-month view.',
  rpDefaultTitle: 'Default',
  rpDefaultDesc: 'Click the start day, then the end day, to select a range.',
  rpPresetsTitle: 'Preset shortcuts',
  rpPresetsDesc: 'The presets attribute shows a list of common ranges above the calendar.',
  rpMultiTitle: 'Multiple months',
  rpMultiDesc: 'months="2" shows several months side by side.',
  rpHolidaysTitle: 'Holidays and weekend',
  rpHolidaysDesc: 'show-holidays and weekends mark holiday and weekend days.',

  // ── <doran-agenda> ─────────────────────────────────────────────────
  agIntro: 'A list view of days with each day’s events — events are set via the events property.',
  agDefaultTitle: 'Current week',
  agDefaultDesc: 'start and events render one week together with its events.',
  agDaysTitle: 'Custom day count',
  agDaysDesc: 'days="3" sets how many days are shown.',
  agRenderTitle: 'Custom event rendering',
  agRenderDesc: 'The renderEvent property (returning an HTML string) styles each event yourself.',

  // ── <doran-nlp-input> ──────────────────────────────────────────────
  nlpIntro:
    'A free-text input that recognises dates and times from natural Persian (e.g. “جمعه ساعت ۷ شب”).',
  nlpDefaultTitle: 'Default',
  nlpDefaultDesc: 'As you type, a preview of the recognised date appears beneath the input.',
  nlpSuggestTitle: 'Suggestions',
  nlpSuggestDesc: 'show-suggestions surfaces a list of completion suggestions under the input.',
  nlpResolveTitle: 'Reading the result',
  nlpResolveDesc: 'Listen to the resolve event to get the parsed result.',

  // ── Theming ────────────────────────────────────────────────────────
  thIntro:
    'Everything is driven by CSS variables. Restyle the whole UI with a handful of --doran-* variables, and manage light/dark with the data-doran-theme attribute on the page root.',
  thTokensTitle: 'Custom theme via CSS variables',
  thTokensDesc:
    'Defining a few --doran-* variables on a wrapper gives the same calendar a new look.',
  thModeTitle: 'Scoped dark theme',
  thModeDesc:
    'The dark theme is just variables under [data-doran-theme="dark"]; put that attribute on any element to scope the dark theme to it.',
};

export const STRINGS: Record<Lang, Dict> = { fa, en };
