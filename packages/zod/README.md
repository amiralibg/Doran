# @doranjs/zod

A framework-agnostic [zod](https://zod.dev) schema for [`DoranDate`](https://github.com/amiralibg/Doran/tree/main/packages/core).

`zDoranDate()` accepts an **ISO-8601 string**, an **epoch number (ms)**, a native **`Date`**, or an existing **`DoranDate`**, and outputs a `DoranDate`. Strings and `Date`s are read as Gregorian instants, so values round-trip with `DoranDate#toISOString()` and `JSON.stringify`.

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

`min` / `max` accept anything `zDoranDate` accepts (ISO string, `Date`, epoch, `DoranDate`) and are **inclusive**:

```ts
zDoranDate({ min: '2024-01-01', max: new Date('2024-12-31T23:59:59.999Z') });
```

## Form integrations

`zDoranDate()` is just a zod schema, so it drops into any zod-based form stack via that stack's standard zod resolver. The form holds a `DoranDate`; submit `value.toISOString()` to your API for Gregorian-out.

### React — react-hook-form

```tsx
import { Controller, useForm } from 'react-hook-form';
import { DoranDatePicker } from '@doranjs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { zDoranDate } from '@doranjs/zod';

const Schema = z.object({ checkIn: zDoranDate({ min: '2024-01-01' }) });

function BookingForm() {
  const { control, handleSubmit, formState } = useForm({ resolver: zodResolver(Schema) });
  const onSubmit = (values) =>
    // values.checkIn is a DoranDate — send Gregorian ISO to the API.
    fetch('/api/book', {
      method: 'POST',
      body: JSON.stringify({ checkIn: values.checkIn.toISOString() }),
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="checkIn"
        render={({ field, fieldState }) => (
          <DoranDatePicker
            {...field}
            invalid={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? 'checkIn-error' : undefined}
          />
        )}
      />
      {formState.errors.checkIn && <p id="checkIn-error">{formState.errors.checkIn.message}</p>}
    </form>
  );
}
```

`Controller` is the right tool here because the form holds a `DoranDate` rather than a
string. `{...field}` supplies `value`, `onChange`, `onBlur`, `name`, and `ref` — the
picker accepts all five.

If you would rather keep strings in the form, set `valueFormat` and use `register`:

```tsx
const Schema = z.object({ checkIn: z.string().min(1) });

<DoranDatePicker valueFormat="YYYY-MM-DD" {...register('checkIn')} />;
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

Svelte (Felte / sveltekit-superforms) and Angular reactive forms follow the same pattern via their zod adapters.

## API

| Export           | Signature                                            | Description                                  |
| ---------------- | ---------------------------------------------------- | -------------------------------------------- |
| `zDoranDate`     | `(options?: { min?, max? }) => ZodSchema<DoranDate>` | The schema.                                  |
| `toDoranDate`    | `(value: unknown) => DoranDate \| null`              | The underlying coercion, exported for reuse. |
| `DoranDateInput` | `string \| number \| Date \| DoranDate`              | Accepted input type.                         |
