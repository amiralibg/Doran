# Backends & serialization

A `DoranDate` is a single **instant**. Show it as Jalali to your users; send it as
**Gregorian UTC** to your server. Same instant, two views — see
[the mental model](/en/guide/getting-started#the-mental-model-one-instant-two-calendars).

## Sending a date to your backend

```ts
// ✅ toISOString() is Gregorian UTC — safe to POST directly
await api.post('/events', { date: d.toISOString() });

// ✅ Display Jalali to the user at the same time
<span>{d.format('YYYY/MM/DD')}</span>;

// ✅ JSON.stringify is also safe — toJSON() emits Gregorian UTC
const body = JSON.stringify({ date: d });
```

## Reading a date back (round-trip)

```ts
const iso = d.toISOString(); // "2026-06-01T08:00:00.000Z"
const restored = DoranDate.fromGregorian(new Date(iso));

restored.isSame(d); // true — round-trips losslessly
```

## `toISOString()` vs `toJalaliISO()`

| Method             | Output                      | Use for                            |
| ------------------ | --------------------------- | ---------------------------------- |
| `toISOString()`    | `2026-06-01T08:00:00.000Z`  | **Backends, APIs, databases**      |
| `toGregorianISO()` | same as `toISOString()`     | explicit alias when intent matters |
| `toJalaliISO()`    | `۱۴۰۵-۰۳-۱۱T۱۱:۳۰:۰۰+۰۳:۳۰` | display / logs only                |

::: danger Don't send `toJalaliISO()` to your API
`toJalaliISO()` is a **human-facing** Jalali rendering (often with Persian digits and a
local offset). It is not a standard interchange format — a backend expecting ISO-8601
will reject it or, worse, silently misparse it. Always serialize with `toISOString()`.
:::

## Why this is safe

`toISOString()` and `toJSON()` both delegate to the native
`new Date(epochMs).toISOString()`, so the bytes you send are identical to what any
other JS date library would produce. The Jalali calendar is purely a _rendering_ layer
on top of the same underlying instant.
