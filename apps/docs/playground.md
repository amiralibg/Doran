# پلی‌گراند

هر قطعه‌کد زیر را ویرایش کنید — به‌صورت زنده و در مرورگر شما روی `@doranjs/core` اجرا می‌شود. کل namespace بسته در دسترس است (`DoranDate`، `Duration`، `parseJalali`، `durationToHuman`، …). با یک expression تمام کنید یا یک مقدار `return` کنید.

## قالب‌بندی تاریخ

<Playground code="DoranDate.now().format('dddd D MMMM YYYY')" />

## خروجی میلادی (برای ارسال به backend)

<Playground code="DoranDate.now().toISOString()" />

## زمان نسبی

<Playground code="DoranDate.now().subtract(3, 'hour').fromNow()" />

## parse رشتهٔ جلالی

<Playground code="parseJalali('1403/01/01', 'YYYY/MM/DD').format('dddd D MMMM YYYY')" />

## مدت‌ها

<Playground code="durationToHuman(3 * 3600 + 20 * 60)" />

## منطقهٔ زمانی

<Playground code="DoranDate.now({ timeZone: 'Asia/Tehran' }).format('HH:mm')" />

## انتخابگر زنده (`@doranjs/wc`)

وب‌کامپوننت مستقل از فریم‌ورک — در هر HTML کار می‌کند، اینجا داخل همین مستندات مبتنی بر Vue:

<PickerDemo />
