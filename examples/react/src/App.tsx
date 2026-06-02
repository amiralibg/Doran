import { DoranDate } from '@doranjs/core';
import { addWorkingDays, getHolidays, getHolidaysOn, workingDaysBetween } from '@doranjs/holidays';
import { occurrences, parseDuration, parseRange, parseRecurrence } from '@doranjs/nlp';
import {
  DoranAgenda,
  DoranCalendar,
  DoranDatePicker,
  DoranNlpInput,
  DoranRangePicker,
  type AgendaEvent,
} from '@doranjs/react';
import { Button, ChevronLeftIcon, ChevronRightIcon, ThemeProvider, useTheme } from '@doranjs/ui';
import { useCallback, useMemo, useState } from 'react';

export function App() {
  return (
    <ThemeProvider defaultMode="light" direction="rtl">
      <Shell />
    </ThemeProvider>
  );
}

function Shell() {
  const { mode, toggleMode } = useTheme();
  const [selected, setSelected] = useState<DoranDate>(DoranDate.now());
  const [withTime, setWithTime] = useState<DoranDate>(DoranDate.now());

  // Mark official holidays on the calendars.
  const isHoliday = useCallback((day: DoranDate) => getHolidaysOn(day).some((h) => h.official), []);

  const holidays = useMemo(
    () => getHolidays(selected.year).filter((h) => h.official),
    [selected.year],
  );

  // All official holidays of the selected year; the agenda only renders the selected
  // week, so it naturally shows the holidays that fall in the week being viewed.
  const events: AgendaEvent[] = holidays.map((h, i) => ({
    id: String(i),
    date: DoranDate.fromJalali(h.year, h.month, h.day),
    title: h.title,
    description: h.titleEn,
    color: h.calendar === 'lunar' ? 'var(--doran-accent)' : 'var(--doran-primary)',
  }));

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">دوران</h1>
          <p className="page__subtitle">اکوسیستم متن‌باز تقویم فارسی — نمونه‌ی امکانات</p>
        </div>
        <Button variant="outline" onClick={toggleMode}>
          {mode === 'light' ? '🌙 تم تیره' : '☀️ تم روشن'}
        </Button>
      </header>

      {/* Calendars ------------------------------------------------------- */}
      <section className="card">
        <h2 className="card__title">تقویم</h2>
        <p className="card__hint">
          انتخاب ماه و سال به‌صورت کشویی، نمایش تعطیلات رسمی و آخر هفته‌ها.
        </p>
        <p className="card__hint">
          ناوبری کامل با صفحه‌کلید: کلیدهای جهت‌نما (روز/هفته)، <kbd>Home</kbd>/<kbd>End</kbd> برای
          ابتدا و انتهای هفته، <kbd>PageUp</kbd>/<kbd>PageDown</kbd> برای ماه (به‌همراه{' '}
          <kbd>Shift</kbd> برای سال) و <kbd>Enter</kbd> برای انتخاب. عبور از لبه‌ی ماه، ماه را عوض
          می‌کند.
        </p>
        <div className="grid">
          <div>
            <span className="field-label">حالت کشویی (پیش‌فرض)</span>
            <DoranCalendar value={selected} onChange={setSelected} isHoliday={isHoliday} />
            <p className="result">انتخاب‌شده: {selected.format('dddd D MMMM YYYY')}</p>
          </div>

          <div>
            <span className="field-label">انتخاب جداگانه ماه/سال</span>
            <DoranCalendar
              headerMode="separate"
              value={selected}
              onChange={setSelected}
              isHoliday={isHoliday}
            />
          </div>

          <div>
            <span className="field-label">با انتخاب ساعت</span>
            <DoranCalendar withTime value={withTime} onChange={setWithTime} isHoliday={isHoliday} />
            <p className="result">{withTime.format('dddd D MMMM YYYY — HH:mm')}</p>
          </div>
        </div>
      </section>

      {/* Pickers --------------------------------------------------------- */}
      <section className="card">
        <h2 className="card__title">انتخابگرها</h2>
        <p className="card__hint">انتخاب تاریخ، تاریخ‌وزمان و بازه‌ی تاریخی.</p>
        <div className="row">
          <div>
            <span className="field-label">انتخاب تاریخ</span>
            <DoranDatePicker value={selected} onChange={setSelected} isHoliday={isHoliday} />
          </div>
          <div>
            <span className="field-label">تاریخ و ساعت</span>
            <DoranDatePicker withTime value={withTime} onChange={setWithTime} />
          </div>
          <div>
            <span className="field-label">بازه‌ی تاریخ (دو ماهه + میان‌برها)</span>
            <DoranRangePicker isHoliday={isHoliday} presets numberOfMonths={2} />
          </div>
        </div>
      </section>

      {/* Working days + advanced NLP ------------------------------------- */}
      <section className="card">
        <h2 className="card__title">روزهای کاری و زبان طبیعی پیشرفته</h2>
        <p className="card__hint">
          محاسبه‌ی روزهای کاری (با احتساب تعطیلات رسمی و جمعه‌ها) و تشخیص بازه، مدت و تکرار از متن
          فارسی.
        </p>
        <WorkdayAndNlpDemo />
      </section>

      {/* Customization --------------------------------------------------- */}
      <section className="card">
        <h2 className="card__title">سفارشی‌سازی کامل</h2>
        <p className="card__hint">
          همه‌چیز با متغیرهای CSS قابل تغییر است: رنگ هر بخش، فونت، سایه، حاشیه، گردی گوشه‌ها و حتی
          فلش‌های ناوبری.
        </p>
        <div className="row">
          <div>
            <span className="field-label">تم «رز» (فقط با متغیرهای CSS)</span>
            <div className="theme-rose">
              <DoranCalendar value={selected} onChange={setSelected} isHoliday={isHoliday} />
            </div>
          </div>
          <div>
            <span className="field-label">فلش‌های سفارشی</span>
            <DoranCalendar
              value={selected}
              onChange={setSelected}
              arrows={{
                prev: <ChevronRightIcon style={{ width: '1.4em', height: '1.4em' }} />,
                next: <ChevronLeftIcon style={{ width: '1.4em', height: '1.4em' }} />,
              }}
              hideFooter
            />
            <div className="chips">
              <span className="chip">رنگ هر بخش</span>
              <span className="chip">فونت</span>
              <span className="chip">سایه</span>
              <span className="chip">گردی گوشه</span>
              <span className="chip">حاشیه</span>
            </div>
          </div>
        </div>
      </section>

      {/* NLP ------------------------------------------------------------- */}
      <section className="card">
        <h2 className="card__title">ورودی زبان طبیعی</h2>
        <p className="card__hint">
          عبارت‌هایی مثل «جمعه ساعت ۷ شب»، «۱۵ خرداد»، «هفته‌ی بعد» یا «یک ربع به ۸» را تایپ کنید؛
          پیشنهادها و تاریخِ تشخیص‌داده‌شده را زنده ببینید.
        </p>
        <NlpDemo />
      </section>

      {/* Agenda ---------------------------------------------------------- */}
      <section className="card">
        <h2 className="card__title">برنامه‌ی هفته (با تعطیلات رسمی)</h2>
        <p className="card__hint">تعطیلات رسمی سالِ انتخاب‌شده روی نمای برنامه.</p>
        <DoranAgenda start={selected.startOf('week')} days={7} events={events} />
      </section>
    </div>
  );
}

function NlpDemo() {
  const [text, setText] = useState('جمعه ساعت ۷ شب');
  const [resolved, setResolved] = useState<DoranDate | null>(null);

  return (
    <div className="stack">
      <DoranNlpInput
        value={text}
        onChange={setText}
        onResolve={(r) => setResolved(r?.date ?? null)}
      />
      <p className="result">
        {resolved
          ? `تشخیص: ${resolved.format('dddd D MMMM YYYY — HH:mm')}`
          : 'هنوز چیزی تشخیص داده نشده'}
      </p>
    </div>
  );
}

function WorkdayAndNlpDemo() {
  const today = DoranDate.now().startOf('day');
  const monthStart = today.startOf('month');
  const nextMonthStart = monthStart.addMonths(1);

  const fifthWorkingDay = addWorkingDays(today, 5);
  const workdaysThisMonth = workingDaysBetween(monthStart, nextMonthStart);

  const range = parseRange('از ۵ تا ۱۰ فروردین');
  const duration = parseDuration('یک ساعت و نیم');
  const recurrence = parseRecurrence('هر دوشنبه');
  const nextMondays = recurrence ? occurrences(recurrence, today, 3) : [];

  return (
    <div className="grid">
      <div className="stack">
        <span className="field-label">روزهای کاری</span>
        <p className="result">۵ روز کاری بعد: {fifthWorkingDay.format('dddd D MMMM YYYY')}</p>
        <p className="result">
          روزهای کاری {today.format('MMMM')}: {workdaysThisMonth.toLocaleString('fa-IR')} روز
        </p>
      </div>
      <div className="stack">
        <span className="field-label">تشخیص از متن</span>
        <p className="result">
          «از ۵ تا ۱۰ فروردین» →{' '}
          {range ? `${range.start.format('D MMMM')} تا ${range.end.format('D MMMM')}` : '—'}
        </p>
        <p className="result">
          «یک ساعت و نیم» → {duration ? `${duration.amount} ${unitLabel(duration.unit)}` : '—'}
        </p>
        <p className="result">
          «هر دوشنبه» → {nextMondays.map((d) => d.format('D MMMM')).join('، ') || '—'}
        </p>
      </div>
    </div>
  );
}

function unitLabel(unit: string): string {
  const labels: Record<string, string> = {
    minute: 'دقیقه',
    hour: 'ساعت',
    day: 'روز',
    week: 'هفته',
    month: 'ماه',
    year: 'سال',
  };
  return labels[unit] ?? unit;
}
