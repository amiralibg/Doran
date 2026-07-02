<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { provideApp } from './i18n/context';
import CalendarSection from './sections/CalendarSection.vue';
import DatePickerSection from './sections/DatePickerSection.vue';
import RangePickerSection from './sections/RangePickerSection.vue';
import AgendaSection from './sections/AgendaSection.vue';
import NlpInputSection from './sections/NlpInputSection.vue';
import ThemingSection from './sections/ThemingSection.vue';

const app = provideApp();

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
const active = ref<string>(NAV[0].id);
let observer: IntersectionObserver | null = null;
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const inView = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (inView[0]) active.value = inView[0].target.id;
    },
    { rootMargin: '-15% 0px -75% 0px' },
  );
  for (const item of NAV) {
    const el = document.getElementById(item.id);
    if (el) observer.observe(el);
  }
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div class="app">
    <aside class="app__nav">
      <div class="app__brand">
        <span class="app__logo">دوران</span>
        <span class="app__brand-sub">{{ app.t('brandSub') }}</span>
      </div>
      <nav>
        <a
          v-for="item in NAV"
          :key="item.id"
          :href="`#${item.id}`"
          :class="item.id === active ? 'app__nav-link app__nav-link--active' : 'app__nav-link'"
          :aria-current="item.id === active ? 'true' : undefined"
        >
          {{ app.t(item.labelKey) }}
        </a>
      </nav>
    </aside>

    <main class="app__main">
      <header class="app__header">
        <div>
          <h1 class="app__title">{{ app.t('headerTitle') }}</h1>
          <p class="app__subtitle">{{ app.t('headerSubtitle') }}</p>
        </div>
        <div class="app__actions">
          <button
            type="button"
            class="app__btn"
            @click="app.setLang(app.lang() === 'fa' ? 'en' : 'fa')"
          >
            {{ app.lang() === 'fa' ? app.t('langToEn') : app.t('langToFa') }}
          </button>
          <button type="button" class="app__btn" @click="app.toggleMode()">
            {{ app.mode() === 'light' ? app.t('themeToDark') : app.t('themeToLight') }}
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
</template>
