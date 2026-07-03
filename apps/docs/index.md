---
layout: home

hero:
  name: دوران
  text: اکوسیستم متن‌باز تقویم فارسی
  tagline: ابزاری کامل، دقیق و دوست‌دار توسعه‌دهنده برای تقویم هجری شمسی (جلالی).
  actions:
    - theme: brand
      text: شروع کنید
      link: /guide/getting-started
    - theme: alt
      text: مشاهده در گیت‌هاب
      link: https://github.com/amiralibg/Doran

features:
  - icon: 📅
    title: دقیق در طراحی
    details: تبدیل تاریخ‌ها بر پایهٔ الگوریتم آزموده‌شدهٔ Borkowski/jalaali انجام می‌شود و با یک مجموعه تست round-trip روزبه‌روز اعتبارسنجی شده است.
  - icon: 🧩
    title: Immutable و Type-safe
    details: یک DoranDate تغییرناپذیر (immutable)، typeهای قوی در همه‌جا، و buildهای tree-shakeable بدون هیچ runtime dependency در core.
  - icon: 🗣️
    title: NLP فارسیِ منعطف
    details: «فردا» یا «جمعه ساعت ۷ شب» را parse کنید — به‌علاوهٔ Finglish («farda») و حتی متنی که با layout انگلیسیِ کیبورد تایپ شده — همراه با یک confidence score.
  - icon: 🎉
    title: تعطیلات از پیش آماده
    details: تعطیلات ملی، مذهبی و فرهنگی ایران — همراه با امکان ثبت تعطیلات سفارشی.
  - icon: ⚛️
    title: بایندینگ برای هر فریم‌ورک
    details: کامپوننت‌های تقویمِ accessible و سازگار با dark mode برای React، Vue، Svelte و Angular — همه روی یک موتور مشترک، به‌علاوهٔ @doranjs/zod برای اعتبارسنجی فرم‌ها.
  - icon: 🌐
    title: همه‌جا کار می‌کند
    details: Web Componentهای مستقل از framework که در HTML ساده، Vue، Svelte یا هر frameworkی جا می‌گیرند — بدون نیاز به build.
  - icon: 🎨
    title: یک Design System قابل theme
    details: یک design system مینیمال که در آن هر بخش — رنگ‌ها، فونت‌ها، سایه‌ها، borderها، گردی‌ها و فلش‌ها — یک CSS variable است که می‌توانید override کنید.
---

## شروع سریع

```bash
pnpm add @doranjs/core
```

```ts
import { DoranDate } from '@doranjs/core';

const today = DoranDate.now();

today.format('YYYY/MM/DD'); // "۱۴۰۵/۰۳/۱۱"
today.addDays(10).format('dddd D MMMM YYYY');
today.toGregorian(); // یک Date نیتیو

DoranDate.fromGregorian(new Date());
```
