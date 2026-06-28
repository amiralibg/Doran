import { type DoranDate } from '@doranjs/core';
import { defineComponent, h, onMounted, type PropType, shallowRef, watch } from 'vue';

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
function useElement<E extends { value: unknown }>(read: () => E['value']) {
  const el = shallowRef<E | null>(null);
  const sync = () => {
    if (el.value) el.value.value = read();
  };
  onMounted(() => ensureElements().then(sync));
  watch(read, sync);
  return el;
}

function detail<T>(e: Event): T {
  return (e as CustomEvent<T>).detail;
}

/** `<doran-datepicker>` — `v-model` is a `DoranDate | null`; `change` also emits the Gregorian `Date`. */
export const DoranDatePicker = defineComponent({
  name: 'DoranDatePicker',
  inheritAttrs: false,
  props: { modelValue: { type: Object as PropType<DoranDate | null>, default: null } },
  emits: {
    'update:modelValue': (_d: DoranDate | null) => true,
    change: (_d: DoranDate | null, _g: Date | null) => true,
  },
  setup(props, { attrs, emit }) {
    const el = useElement<HTMLElement & { value: DoranDate | null }>(() => props.modelValue);
    const onChange = (e: Event) => {
      const date = detail<{ date: DoranDate | null }>(e).date;
      emit('update:modelValue', date);
      emit('change', date, date ? date.toGregorian() : null);
    };
    return () => h('doran-datepicker', { ref: el, ...attrs, onChange });
  },
});

/** `<doran-calendar>` — inline month grid. `v-model` is a `DoranDate | null`. */
export const DoranCalendar = defineComponent({
  name: 'DoranCalendar',
  inheritAttrs: false,
  props: { modelValue: { type: Object as PropType<DoranDate | null>, default: null } },
  emits: {
    'update:modelValue': (_d: DoranDate | null) => true,
    change: (_d: DoranDate | null, _g: Date | null) => true,
  },
  setup(props, { attrs, emit }) {
    const el = useElement<HTMLElement & { value: DoranDate | null }>(() => props.modelValue);
    const onChange = (e: Event) => {
      const date = detail<{ date: DoranDate }>(e).date;
      emit('update:modelValue', date);
      emit('change', date, date ? date.toGregorian() : null);
    };
    return () => h('doran-calendar', { ref: el, ...attrs, onChange });
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
  },
  emits: {
    'update:modelValue': (_r: DoranDateRange) => true,
    change: (_r: DoranDateRange, _g: GregorianDateRange) => true,
  },
  setup(props, { attrs, emit }) {
    const el = useElement<HTMLElement & { value: DoranDateRange }>(() => props.modelValue);
    const onChange = (e: Event) => {
      const range = detail<DoranDateRange>(e);
      emit('update:modelValue', range);
      emit('change', range, {
        start: range.start ? range.start.toGregorian() : null,
        end: range.end ? range.end.toGregorian() : null,
      });
    };
    return () => h('doran-rangepicker', { ref: el, ...attrs, onChange });
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
    const onInput = (e: Event) => emit('update:modelValue', detail<{ value: string }>(e).value);
    const onResolve = (e: Event) => emit('resolve', detail<{ result: unknown }>(e).result);
    const onChange = (e: Event) => emit('change', detail<{ result: unknown }>(e).result);
    return () => h('doran-nlp-input', { ref: el, ...attrs, onInput, onResolve, onChange });
  },
});

/** `<doran-agenda>` — month agenda. Emits `selectday(DoranDate)`; pass `events` through attrs. */
export const DoranAgenda = defineComponent({
  name: 'DoranAgenda',
  inheritAttrs: false,
  emits: { selectday: (_d: DoranDate) => true },
  setup(_props, { attrs, emit }) {
    onMounted(() => ensureElements());
    const onSelectday = (e: Event) => emit('selectday', detail<{ date: DoranDate }>(e).date);
    return () => h('doran-agenda', { ...attrs, onSelectday });
  },
});
