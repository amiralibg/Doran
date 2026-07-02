# @doranjs/zod

A framework-agnostic [zod](https://zod.dev) schema for [`DoranDate`](/en/api/core).

`zDoranDate()` accepts an **ISO-8601 string**, an **epoch number (ms)**, a native **`Date`**, or an
existing **`DoranDate`**, and outputs a `DoranDate`. Strings and `Date`s are read as Gregorian
instants, so values round-trip with `DoranDate#toISOString()` and `JSON.stringify`.

```bash
pnpm add @doranjs/zod zod @doranjs/core
```

## Usage

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
// Submit Gregorian back to a backend:
fetch('/api/book', { body: JSON.stringify({ checkIn: parsed.checkIn.toISOString() }) });
```

### Bounds

`min` / `max` accept anything `zDoranDate` accepts (ISO string, `Date`, epoch, `DoranDate`) and are
**inclusive**:

```ts
zDoranDate({ min: '2024-01-01', max: new Date('2024-12-31T23:59:59.999Z') });
```

## Form integrations

`zDoranDate()` is just a zod schema, so it drops into any zod-based form stack via that stack's
standard zod resolver. The form holds a `DoranDate`; submit `value.toISOString()` to your API for
Gregorian-out.

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
    // values.checkIn is a DoranDate — send Gregorian ISO to the API.
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
  // values.checkIn is a DoranDate — send Gregorian ISO to the API.
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

Svelte (Felte / sveltekit-superforms) and Angular reactive forms follow the same pattern via their
zod adapters.

## API

| Export           | Signature                                            | Description                                  |
| ---------------- | ---------------------------------------------------- | -------------------------------------------- |
| `zDoranDate`     | `(options?: { min?, max? }) => ZodSchema<DoranDate>` | The schema.                                  |
| `toDoranDate`    | `(value: unknown) => DoranDate \| null`              | The underlying coercion, exported for reuse. |
| `DoranDateInput` | `string \| number \| Date \| DoranDate`              | Accepted input type.                         |
