<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { lang, mode, t, toggleLang, toggleMode } from './i18n/store';
  import CalendarSection from './sections/CalendarSection.svelte';
  import DatePickerSection from './sections/DatePickerSection.svelte';
  import RangePickerSection from './sections/RangePickerSection.svelte';
  import AgendaSection from './sections/AgendaSection.svelte';
  import NlpInputSection from './sections/NlpInputSection.svelte';
  import ThemingSection from './sections/ThemingSection.svelte';

  // Each entry's `id` matches a <Section id="…"> and `labelKey` a dictionary key.
  const NAV = [
    { id: 'calendar', labelKey: 'navCalendar' },
    { id: 'datepicker', labelKey: 'navDatePicker' },
    { id: 'rangepicker', labelKey: 'navRangePicker' },
    { id: 'agenda', labelKey: 'navAgenda' },
    { id: 'nlp-input', labelKey: 'navNlpInput' },
    { id: 'theming', labelKey: 'navTheming' },
  ] as const;

  // Scroll-spy: highlight the nav link for the section currently near the top.
  let active = NAV[0].id as string;
  let observer: IntersectionObserver | undefined;
  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (inView[0]) active = inView[0].target.id;
      },
      { rootMargin: '-15% 0px -75% 0px' },
    );
    for (const item of NAV) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
  });
  onDestroy(() => observer?.disconnect());
</script>

<div class="app">
  <aside class="app__nav">
    <div class="app__brand">
      <span class="app__logo">دوران</span>
      <span class="app__brand-sub">{$t('brandSub')}</span>
    </div>
    <nav>
      {#each NAV as item (item.id)}
        <a
          href={`#${item.id}`}
          class={item.id === active ? 'app__nav-link app__nav-link--active' : 'app__nav-link'}
          aria-current={item.id === active ? 'true' : undefined}
        >
          {$t(item.labelKey)}
        </a>
      {/each}
    </nav>
  </aside>

  <main class="app__main">
    <header class="app__header">
      <div>
        <h1 class="app__title">{$t('headerTitle')}</h1>
        <p class="app__subtitle">{$t('headerSubtitle')}</p>
      </div>
      <div class="app__actions">
        <button type="button" class="app__btn" on:click={toggleLang}>
          {$lang === 'fa' ? $t('langToEn') : $t('langToFa')}
        </button>
        <button type="button" class="app__btn" on:click={toggleMode}>
          {$mode === 'light' ? $t('themeToDark') : $t('themeToLight')}
        </button>
      </div>
    </header>

    <CalendarSection />
    <DatePickerSection />
    <RangePickerSection />
    <AgendaSection />
    <NlpInputSection />
    <ThemingSection />
  </main>
</div>
