# Playground

Edit any snippet below — it runs live against `@doranjs/core` in your browser. The whole package namespace is in scope (`DoranDate`, `Duration`, `parseJalali`, `durationToHuman`, …). End with an expression, or `return` a value.

## Format a date

<Playground code="DoranDate.now().format('dddd D MMMM YYYY')" />

## Gregorian out (send to a backend)

<Playground code="DoranDate.now().toISOString()" />

## Relative time

<Playground code="DoranDate.now().subtract(3, 'hour').fromNow()" />

## Parse a Jalali string

<Playground code="parseJalali('1403/01/01', 'YYYY/MM/DD').format('dddd D MMMM YYYY')" />

## Durations

<Playground code="durationToHuman(3 * 3600 + 20 * 60)" />

## Time zones

<Playground code="DoranDate.now({ timeZone: 'Asia/Tehran' }).format('HH:mm')" />

## Live picker (`@doranjs/wc`)

The framework-agnostic web component — works in any HTML, here inside these Vue-based docs:

<PickerDemo />
