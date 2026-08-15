import { type DayDataMap, type DoranDate } from '@doranjs/core';
import { type AgendaEvent } from '@doranjs/wc';
import { defineComponent, h, onMounted, type PropType, shallowRef, watch } from 'vue';
import { type DoranDefaults, injectDoranDefaults } from './provider';

/** Range value shared by the range picker — mirrors `@doranjs/react`'s shape. */
export interface DoranDateRange {
  start: DoranDate | null;
  end: DoranDate | null;
}
export interface GregorianDateRange {
  start: Date | null;
  end: Date | null;
}

// @doranjs/wc auto-registers the custom elements on import (SSR-guarded). We load
// it once on the client so the elements upgrade; SSR just emits the inert tag.
let wcLoaded: Promise<unknown> | null = null;
function ensureElements(): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.resolve();
  wcLoaded ??= import('@doranjs/wc');
  return wcLoaded;
}

// DoranDate carries private fields — never let Vue deep-proxy it. Element refs and
// any DoranDate values live in shallowRef, and props are shallowReactive already.
function useElement<E extends { value: unknown }>(
  read: () => E['value'],
  /**
   * Values that must be assigned as element *properties* rather than attributes —
   * `dayData` maps and `disabledDates` predicates can't be stringified. Vue would
   * normally infer this, but only once the custom element has upgraded, and
   * `ensureElements()` resolves after the first render.
   */
  readProperties?: () => Record<string, unknown>,
) {
  const el = shallowRef<E | null>(null);
  const sync = () => {
    if (!el.value) return;
    el.value.value = read();
    if (!readProperties) return;
    for (const [key, value] of Object.entries(readProperties())) {
      if (value !== undefined) (el.value as unknown as Record<string, unknown>)[key] = value;
    }
  };
  onMounted(() => ensureElements().then(sync));
  watch(read, sync);
  if (readProperties) watch(readProperties, sync);
  return el;
}

/** Props every calendar-like element accepts but that cannot travel as attributes. */
const dayWidgetProps = {
  dayData: { type: Object as PropType<DayDataMap | null>, default: undefined },
  disabledDates: {
    type: Function as unknown as PropType<((day: DoranDate) => boolean) | null>,
    default: undefined,
  },
} as const;

function detail<T>(e: Event): T {
  return (e as CustomEvent<T>).detail;
}

// Merge provider defaults under the element's own attrs, so an explicit `locale`
// attribute always wins over the provider's.
function mergeDefaults(
  defaults: DoranDefaults,
  attrs: Record<string, unknown>,
): Record<string, unknown> {
  return defaults.locale != null ? { locale: defaults.locale, ...attrs } : attrs;
}

/** `<doran-datepicker>` — `v-model` is a `DoranDate | null`; `change` also emits the Gregorian `Date`. */
export const DoranDatePicker = defineComponent({
  name: 'DoranDatePicker',
  inheritAttrs: false,
  props: {
    modelValue: { type: Object as PropType<DoranDate | null>, default: null },
    ...dayWidgetProps,
  },
  emits: {
    'update:modelValue': (_d: DoranDate | null) => true,
    change: (_d: DoranDate | null, _g: Date | null) => true,
  },
  setup(props, { attrs, emit, slots }) {
    const el = useElement<HTMLElement & { value: DoranDate | null }>(
      () => props.modelValue,
      () => ({ dayData: props.dayData, disabledDates: props.disabledDates }),
    );
    const defaults = injectDoranDefaults();
    const onChange = (e: Event) => {
      const date = detail<{ date: DoranDate | null }>(e).date;
      emit('update:modelValue', date);
      emit('change', date, date ? date.toGregorian() : null);
    };
    // Children (e.g. a custom `slot="icon"` node) pass through to the element.
    return () =>
      h(
        'doran-datepicker',
        { ref: el, ...mergeDefaults(defaults, attrs), onChange },
        slots.default?.(),
      );
  },
});

/** `<doran-calendar>` — inline month grid. `v-model` is a `DoranDate | null`. */
export const DoranCalendar = defineComponent({
  name: 'DoranCalendar',
  inheritAttrs: false,
  props: {
    modelValue: { type: Object as PropType<DoranDate | null>, default: null },
    ...dayWidgetProps,
  },
  emits: {
    'update:modelValue': (_d: DoranDate | null) => true,
    change: (_d: DoranDate | null, _g: Date | null) => true,
  },
  setup(props, { attrs, emit, slots }) {
    const el = useElement<HTMLElement & { value: DoranDate | null }>(
      () => props.modelValue,
      () => ({ dayData: props.dayData, disabledDates: props.disabledDates }),
    );
    const defaults = injectDoranDefaults();
    const onChange = (e: Event) => {
      const date = detail<{ date: DoranDate }>(e).date;
      emit('update:modelValue', date);
      emit('change', date, date ? date.toGregorian() : null);
    };
    // Children carry `slot="legend"|"aside"|"footer"` straight through to the element.
    return () =>
      h(
        'doran-calendar',
        { ref: el, ...mergeDefaults(defaults, attrs), onChange },
        slots.default?.(),
      );
  },
});

/** `<doran-rangepicker>` — `v-model` is `{ start, end }` of `DoranDate`; `change` emits the Gregorian range. */
export const DoranRangePicker = defineComponent({
  name: 'DoranRangePicker',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Object as PropType<DoranDateRange>,
      default: () => ({ start: null, end: null }),
    },
    ...dayWidgetProps,
  },
  emits: {
    'update:modelValue': (_r: DoranDateRange) => true,
    change: (_r: DoranDateRange, _g: GregorianDateRange) => true,
  },
  setup(props, { attrs, emit, slots }) {
    const el = useElement<HTMLElement & { value: DoranDateRange }>(
      () => props.modelValue,
      () => ({ dayData: props.dayData, disabledDates: props.disabledDates }),
    );
    const defaults = injectDoranDefaults();
    const onChange = (e: Event) => {
      const range = detail<DoranDateRange>(e);
      emit('update:modelValue', range);
      emit('change', range, {
        start: range.start ? range.start.toGregorian() : null,
        end: range.end ? range.end.toGregorian() : null,
      });
    };
    return () =>
      h(
        'doran-rangepicker',
        { ref: el, ...mergeDefaults(defaults, attrs), onChange },
        slots.default?.(),
      );
  },
});

/** `<doran-rangedatepicker>` — a range input with a pop-over grid. `v-model` is `{ start, end }`. */
export const DoranRangeDatePicker = defineComponent({
  name: 'DoranRangeDatePicker',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Object as PropType<DoranDateRange>,
      default: () => ({ start: null, end: null }),
    },
    ...dayWidgetProps,
  },
  emits: {
    'update:modelValue': (_r: DoranDateRange) => true,
    change: (_r: DoranDateRange, _g: GregorianDateRange) => true,
  },
  setup(props, { attrs, emit, slots }) {
    const el = useElement<HTMLElement & { value: DoranDateRange }>(
      () => props.modelValue,
      () => ({ dayData: props.dayData, disabledDates: props.disabledDates }),
    );
    const defaults = injectDoranDefaults();
    const onChange = (e: Event) => {
      const range = detail<DoranDateRange>(e);
      emit('update:modelValue', range);
      emit('change', range, {
        start: range.start ? range.start.toGregorian() : null,
        end: range.end ? range.end.toGregorian() : null,
      });
    };
    return () =>
      h(
        'doran-rangedatepicker',
        { ref: el, ...mergeDefaults(defaults, attrs), onChange },
        slots.default?.(),
      );
  },
});

/** `<doran-nlp-input>` — natural-language date input. `v-model` is the text string. */
export const DoranNlpInput = defineComponent({
  name: 'DoranNlpInput',
  inheritAttrs: false,
  props: { modelValue: { type: String, default: '' } },
  emits: {
    'update:modelValue': (_v: string) => true,
    resolve: (_r: unknown) => true,
    change: (_r: unknown) => true,
  },
  setup(props, { attrs, emit }) {
    const el = useElement<HTMLElement & { value: string }>(() => props.modelValue);
    const defaults = injectDoranDefaults();
    const onInput = (e: Event) => emit('update:modelValue', detail<{ value: string }>(e).value);
    const onResolve = (e: Event) => emit('resolve', detail<{ result: unknown }>(e).result);
    const onChange = (e: Event) => emit('change', detail<{ result: unknown }>(e).result);
    return () =>
      h('doran-nlp-input', {
        ref: el,
        ...mergeDefaults(defaults, attrs),
        onInput,
        onResolve,
        onChange,
      });
  },
});

// `start`, `events`, and `renderEvent` are element *properties* (a DoranDate, an
// array, a function) — not attributes — so they must be assigned after the element
// upgrades, exactly like `value` on the other components. `days`/`locale` stay in
// attrs (real string attributes).
type AgendaEl = HTMLElement & {
  start: DoranDate | null;
  events: AgendaEvent[];
  renderEvent: ((event: AgendaEvent) => string) | null;
};

/** `<doran-agenda>` — vertical agenda. `start`/`events`/`renderEvent` are props; emits `selectday(DoranDate)`. */
export const DoranAgenda = defineComponent({
  name: 'DoranAgenda',
  inheritAttrs: false,
  props: {
    start: { type: Object as PropType<DoranDate | null>, default: null },
    events: { type: Array as PropType<AgendaEvent[]>, default: () => [] },
    renderEvent: {
      type: Function as PropType<(event: AgendaEvent) => string>,
      default: undefined,
    },
  },
  emits: { selectday: (_d: DoranDate) => true },
  setup(props, { attrs, emit }) {
    const el = shallowRef<AgendaEl | null>(null);
    const defaults = injectDoranDefaults();
    const sync = () => {
      const node = el.value;
      if (!node) return;
      if (props.start) node.start = props.start;
      node.events = props.events;
      node.renderEvent = props.renderEvent ?? null;
    };
    onMounted(() => ensureElements().then(sync));
    watch(() => [props.start, props.events, props.renderEvent], sync);
    const onSelectday = (e: Event) => emit('selectday', detail<{ date: DoranDate }>(e).date);
    return () => h('doran-agenda', { ref: el, ...mergeDefaults(defaults, attrs), onSelectday });
  },
});
