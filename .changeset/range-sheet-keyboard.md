---
'@doranjs/react': minor
'@doranjs/wc': minor
---

Stop the range picker's keyboard covering its own sheet

`DoranRangeDatePicker` and `<doran-rangedatepicker>` open on focus, so unlike the
single picker they cannot give up the caret when the calendar appears — that is the
very thing that opened it. On a phone the on-screen keyboard therefore rose over the
sheet the focus had just opened.

Their fields now go `readonly` while presenting as a sheet on a coarse pointer, which
is the one signal browsers honour for "focus this, but do not raise a keyboard". The
field stays focusable, so focus still opens the picker, and the open-on-focus check
still reads the real `readOnly` prop rather than this.

Scoped deliberately: only a sheet, and only an actual finger. A narrow desktop window
is also a sheet, and there a mouse raises no keyboard, so taking typing away would
cost something and buy nothing. `mode="popover"` opts out entirely.
