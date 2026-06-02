import type { LunarHolidayDef, SolarHolidayDef } from './types';

/**
 * Holidays and observances fixed on the solar (Jalali) calendar. These recur on the
 * same Jalali date every year and are exact.
 *
 * `official: true` marks a public day off. `official: false` entries are cultural or
 * commemorative observances (مناسبت‌ها) that calendars display but are working days.
 */
export const SOLAR_HOLIDAYS: SolarHolidayDef[] = [
  // ---- Farvardin (فروردین) ----
  {
    month: 1,
    day: 1,
    title: 'عید نوروز',
    titleEn: 'Nowruz',
    type: 'national',
    official: true,
    description: 'آغاز سال نو خورشیدی و جشن باستانی نوروز',
  },
  { month: 1, day: 2, title: 'عید نوروز', titleEn: 'Nowruz', type: 'national', official: true },
  { month: 1, day: 3, title: 'عید نوروز', titleEn: 'Nowruz', type: 'national', official: true },
  { month: 1, day: 4, title: 'عید نوروز', titleEn: 'Nowruz', type: 'national', official: true },
  {
    month: 1,
    day: 12,
    title: 'روز جمهوری اسلامی',
    titleEn: 'Islamic Republic Day',
    type: 'national',
    official: true,
  },
  {
    month: 1,
    day: 13,
    title: 'روز طبیعت (سیزده‌به‌در)',
    titleEn: 'Nature Day (Sizdah Bedar)',
    type: 'national',
    official: true,
  },

  // ---- Ordibehesht (اردیبهشت) ----
  {
    month: 2,
    day: 1,
    title: 'روز بزرگداشت سعدی',
    titleEn: 'Saadi Commemoration Day',
    type: 'cultural',
    official: false,
  },
  {
    month: 2,
    day: 10,
    title: 'روز ملی خلیج فارس',
    titleEn: 'National Persian Gulf Day',
    type: 'national',
    official: false,
  },
  {
    month: 2,
    day: 12,
    title: 'روز معلم',
    titleEn: "Teacher's Day",
    type: 'national',
    official: false,
  },
  {
    month: 2,
    day: 25,
    title: 'روز بزرگداشت فردوسی',
    titleEn: 'Ferdowsi Commemoration Day',
    type: 'cultural',
    official: false,
  },
  {
    month: 2,
    day: 28,
    title: 'روز بزرگداشت حکیم عمر خیام',
    titleEn: 'Omar Khayyam Commemoration Day',
    type: 'cultural',
    official: false,
  },

  // ---- Khordad (خرداد) ----
  {
    month: 3,
    day: 3,
    title: 'فتح خرمشهر',
    titleEn: 'Liberation of Khorramshahr',
    type: 'national',
    official: false,
  },
  {
    month: 3,
    day: 14,
    title: 'رحلت امام خمینی',
    titleEn: 'Demise of Imam Khomeini',
    type: 'national',
    official: true,
  },
  {
    month: 3,
    day: 15,
    title: 'قیام ۱۵ خرداد',
    titleEn: 'Uprising of 15 Khordad',
    type: 'national',
    official: true,
  },

  // ---- Tir (تیر) ----
  {
    month: 4,
    day: 10,
    title: 'روز صنعت و معدن',
    titleEn: 'Industry and Mine Day',
    type: 'cultural',
    official: false,
  },
  {
    month: 4,
    day: 14,
    title: 'روز قلم',
    titleEn: 'Pen Day',
    type: 'cultural',
    official: false,
  },

  // ---- Mordad (مرداد) ----
  {
    month: 5,
    day: 14,
    title: 'صدور فرمان مشروطیت',
    titleEn: 'Constitutional Revolution Day',
    type: 'national',
    official: false,
  },

  // ---- Shahrivar (شهریور) ----
  {
    month: 6,
    day: 13,
    title: 'روز بزرگداشت ابوریحان بیرونی و روز تعاون',
    titleEn: 'Abu Rayhan Biruni & Cooperatives Day',
    type: 'cultural',
    official: false,
  },
  {
    month: 6,
    day: 17,
    title: 'قیام ۱۷ شهریور',
    titleEn: 'Uprising of 17 Shahrivar',
    type: 'national',
    official: false,
  },
  {
    month: 6,
    day: 31,
    title: 'آغاز هفته دفاع مقدس',
    titleEn: 'Start of Sacred Defence Week',
    type: 'national',
    official: false,
  },

  // ---- Mehr (مهر) ----
  {
    month: 7,
    day: 8,
    title: 'روز بزرگداشت مولوی',
    titleEn: 'Rumi Commemoration Day',
    type: 'cultural',
    official: false,
  },
  {
    month: 7,
    day: 13,
    title: 'روز نیروی انتظامی',
    titleEn: 'Police Force Day',
    type: 'national',
    official: false,
  },
  {
    month: 7,
    day: 20,
    title: 'روز بزرگداشت حافظ',
    titleEn: 'Hafez Commemoration Day',
    type: 'cultural',
    official: false,
  },

  // ---- Aban (آبان) ----
  {
    month: 8,
    day: 13,
    title: 'روز دانش‌آموز',
    titleEn: "Student's Day",
    type: 'national',
    official: false,
  },
  {
    month: 8,
    day: 24,
    title: 'روز کتاب و کتابخوانی',
    titleEn: 'Book and Reading Day',
    type: 'cultural',
    official: false,
  },

  // ---- Azar (آذر) ----
  {
    month: 9,
    day: 7,
    title: 'روز نیروی دریایی',
    titleEn: 'Navy Day',
    type: 'national',
    official: false,
  },
  {
    month: 9,
    day: 16,
    title: 'روز دانشجو',
    titleEn: 'Student Day',
    type: 'national',
    official: false,
  },
  {
    month: 9,
    day: 30,
    title: 'شب یلدا (چله)',
    titleEn: 'Yalda Night',
    type: 'cultural',
    official: false,
    description: 'بلندترین شب سال و جشن باستانی چله',
  },

  // ---- Dey (دی) ----
  {
    month: 10,
    day: 9,
    title: 'روز بصیرت',
    titleEn: 'Day of Insight',
    type: 'national',
    official: false,
  },

  // ---- Bahman (بهمن) ----
  {
    month: 11,
    day: 12,
    title: 'بازگشت امام خمینی به ایران',
    titleEn: 'Return of Imam Khomeini',
    type: 'national',
    official: false,
  },
  {
    month: 11,
    day: 19,
    title: 'روز نیروی هوایی',
    titleEn: 'Air Force Day',
    type: 'national',
    official: false,
  },
  {
    month: 11,
    day: 22,
    title: 'پیروزی انقلاب اسلامی',
    titleEn: 'Victory of the Islamic Revolution',
    type: 'national',
    official: true,
  },

  // ---- Esfand (اسفند) ----
  {
    month: 12,
    day: 5,
    title: 'روز بزرگداشت خواجه نصیر و روز مهندس',
    titleEn: "Khwaja Nasir & Engineer's Day",
    type: 'cultural',
    official: false,
  },
  {
    month: 12,
    day: 15,
    title: 'روز درختکاری',
    titleEn: 'Arbor Day',
    type: 'cultural',
    official: false,
  },
  {
    month: 12,
    day: 29,
    title: 'روز ملی شدن صنعت نفت',
    titleEn: 'Nationalization of the Oil Industry',
    type: 'national',
    official: true,
  },
];

/**
 * Religious holidays anchored to the Hijri (lunar) calendar. Dates are recomputed per
 * year from the tabular calendar and flagged `approximate`, since Iran's official
 * announcements follow lunar sighting and can differ by ±1 day.
 *
 * Days conventionally on the last day of a month (e.g. آخر صفر) are clamped to the
 * tabular month length when resolved.
 */
export const LUNAR_HOLIDAYS: LunarHolidayDef[] = [
  // ---- Muharram (محرم) ----
  {
    hijriMonth: 1,
    hijriDay: 9,
    title: 'تاسوعای حسینی',
    titleEn: 'Tasua',
    type: 'religious',
    official: true,
  },
  {
    hijriMonth: 1,
    hijriDay: 10,
    title: 'عاشورای حسینی',
    titleEn: 'Ashura',
    type: 'religious',
    official: true,
  },

  // ---- Safar (صفر) ----
  {
    hijriMonth: 2,
    hijriDay: 20,
    title: 'اربعین حسینی',
    titleEn: 'Arbaeen',
    type: 'religious',
    official: true,
  },
  {
    hijriMonth: 2,
    hijriDay: 28,
    title: 'رحلت پیامبر و شهادت امام حسن مجتبی',
    titleEn: 'Demise of the Prophet & Martyrdom of Imam Hasan',
    type: 'religious',
    official: true,
  },
  {
    hijriMonth: 2,
    hijriDay: 30,
    title: 'شهادت امام رضا',
    titleEn: 'Martyrdom of Imam Reza',
    type: 'religious',
    official: true,
  },

  // ---- Rabi al-Awwal (ربیع‌الاول) ----
  {
    hijriMonth: 3,
    hijriDay: 8,
    title: 'شهادت امام حسن عسکری',
    titleEn: 'Martyrdom of Imam Hasan al-Askari',
    type: 'religious',
    official: true,
  },
  {
    hijriMonth: 3,
    hijriDay: 17,
    title: 'میلاد پیامبر و امام صادق',
    titleEn: 'Birth of the Prophet & Imam Sadiq',
    type: 'religious',
    official: true,
  },

  // ---- Jumada al-Thani (جمادی‌الثانی) ----
  {
    hijriMonth: 6,
    hijriDay: 3,
    title: 'شهادت حضرت فاطمه زهرا',
    titleEn: 'Martyrdom of Fatimah',
    type: 'religious',
    official: true,
  },

  // ---- Rajab (رجب) ----
  {
    hijriMonth: 7,
    hijriDay: 13,
    title: 'ولادت امام علی',
    titleEn: 'Birth of Imam Ali',
    type: 'religious',
    official: true,
  },
  {
    hijriMonth: 7,
    hijriDay: 27,
    title: 'مبعث پیامبر',
    titleEn: "Prophet's Mission (Mab'ath)",
    type: 'religious',
    official: true,
  },

  // ---- Sha'ban (شعبان) ----
  {
    hijriMonth: 8,
    hijriDay: 3,
    title: 'ولادت امام حسین و روز پاسدار',
    titleEn: 'Birth of Imam Husayn',
    type: 'religious',
    official: false,
  },
  {
    hijriMonth: 8,
    hijriDay: 15,
    title: 'ولادت امام زمان (نیمه شعبان)',
    titleEn: 'Birth of Imam Mahdi',
    type: 'religious',
    official: true,
  },

  // ---- Ramadan (رمضان) ----
  {
    hijriMonth: 9,
    hijriDay: 19,
    title: 'شب قدر (ضربت خوردن امام علی)',
    titleEn: 'Laylat al-Qadr (19th)',
    type: 'religious',
    official: false,
  },
  {
    hijriMonth: 9,
    hijriDay: 21,
    title: 'شهادت امام علی',
    titleEn: 'Martyrdom of Imam Ali',
    type: 'religious',
    official: true,
  },
  {
    hijriMonth: 9,
    hijriDay: 23,
    title: 'شب قدر',
    titleEn: 'Laylat al-Qadr (23rd)',
    type: 'religious',
    official: false,
  },

  // ---- Shawwal (شوال) ----
  {
    hijriMonth: 10,
    hijriDay: 1,
    title: 'عید سعید فطر',
    titleEn: 'Eid al-Fitr',
    type: 'religious',
    official: true,
  },
  {
    hijriMonth: 10,
    hijriDay: 2,
    title: 'تعطیل عید فطر',
    titleEn: 'Eid al-Fitr Holiday',
    type: 'religious',
    official: true,
  },
  {
    hijriMonth: 10,
    hijriDay: 25,
    title: 'شهادت امام صادق',
    titleEn: 'Martyrdom of Imam Sadiq',
    type: 'religious',
    official: true,
  },

  // ---- Dhu al-Hijjah (ذی‌الحجه) ----
  {
    hijriMonth: 12,
    hijriDay: 10,
    title: 'عید سعید قربان',
    titleEn: 'Eid al-Adha',
    type: 'religious',
    official: true,
  },
  {
    hijriMonth: 12,
    hijriDay: 18,
    title: 'عید سعید غدیر خم',
    titleEn: 'Eid al-Ghadir',
    type: 'religious',
    official: true,
  },
];
