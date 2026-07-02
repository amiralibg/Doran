# @doranjs/zod

یک schemaِ [zod](https://zod.dev)ِ framework-agnostic برای [`DoranDate`](/api/core).

`zDoranDate()` یک **رشتهٔ ISO-8601**، یک **عددِ epoch (میلی‌ثانیه)**، یک **`Date`ِ نیتیو** یا یک
**`DoranDate`ِ موجود** را می‌پذیرد و یک `DoranDate` خروجی می‌دهد. رشته‌ها و `Date`ها به‌عنوان
لحظه‌های میلادی خوانده می‌شوند، پس مقادیر با `DoranDate#toISOString()` و `JSON.stringify` رفت‌وبرگشت
می‌کنند.

```bash
pnpm add @doranjs/zod zod @doranjs/core
```

## استفاده

```ts
import { z } from 'zod';
import { zDoranDate } from '@doranjs/zod';

const Booking = z.object({
  checkIn: zDoranDate({ min: '2024-01-01' }),
  checkOut: zDoranDate(),
});

const parsed = Booking.parse({
  checkIn: '2024-06-28',
  checkOut: new Date(),
});

parsed.checkIn; // DoranDate
// میلادی را به backend برگردانید:
fetch('/api/book', { body: JSON.stringify({ checkIn: parsed.checkIn.toISOString() }) });
```

### bounds

`min` / `max` هر چیزی که `zDoranDate` می‌پذیرد را قبول می‌کنند (رشتهٔ ISO، `Date`، epoch،
`DoranDate`) و **inclusive** هستند:

```ts
zDoranDate({ min: '2024-01-01', max: new Date('2024-12-31T23:59:59.999Z') });
```

## یکپارچگی با فرم‌ها

`zDoranDate()` صرفاً یک schemaِ zod است، پس از طریقِ resolverِ استانداردِ zodِ هر stack داخلِ آن
می‌افتد. فرم یک `DoranDate` نگه می‌دارد؛ برای خروجیِ میلادی `value.toISOString()` را به API بفرستید.

### React — react-hook-form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { zDoranDate } from '@doranjs/zod';

const Schema = z.object({ checkIn: zDoranDate({ min: '2024-01-01' }) });

function BookingForm() {
  const { register, handleSubmit } = useForm({ resolver: zodResolver(Schema) });
  const onSubmit = (values) =>
    // values.checkIn یک DoranDate است — میلادیِ ISO را به API بفرستید.
    fetch('/api/book', {
      method: 'POST',
      body: JSON.stringify({ checkIn: values.checkIn.toISOString() }),
    });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="date" {...register('checkIn')} />
    </form>
  );
}
```

### Vue — VeeValidate

```vue
<script setup>
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { zDoranDate } from '@doranjs/zod';

const schema = toTypedSchema(z.object({ checkIn: zDoranDate({ min: '2024-01-01' }) }));
const { handleSubmit, defineField } = useForm({ validationSchema: schema });
const [checkIn] = defineField('checkIn');

const onSubmit = handleSubmit((values) =>
  // values.checkIn یک DoranDate است — میلادیِ ISO را به API بفرستید.
  fetch('/api/book', {
    method: 'POST',
    body: JSON.stringify({ checkIn: values.checkIn.toISOString() }),
  }),
);
</script>

<template>
  <form @submit="onSubmit"><input type="date" v-model="checkIn" /></form>
</template>
```

Svelte (‏Felte / sveltekit-superforms) و فرم‌های reactiveِ Angular همین الگو را از طریقِ adapterهای
zodِ خودشان دنبال می‌کنند.

## API

| Export           | امضا                                                 | توضیح                                           |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `zDoranDate`     | `(options?: { min?, max? }) => ZodSchema<DoranDate>` | خودِ schema.                                    |
| `toDoranDate`    | `(value: unknown) => DoranDate \| null`              | coercionِ زیرین، export‌شده برای استفادهٔ مجدد. |
| `DoranDateInput` | `string \| number \| Date \| DoranDate`              | نوعِ ورودیِ پذیرفته‌شده.                        |
