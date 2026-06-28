<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  code: { type: String, default: "DoranDate.now().format('dddd D MMMM YYYY')" },
});

const source = ref(props.code.trim());
const output = ref('');
const error = ref('');
// The whole @doranjs/core namespace, loaded client-side (it's browser-safe, no Node deps).
let ns = null;

function present(value) {
  if (value == null) return String(value);
  if (ns && value instanceof ns.DoranDate) {
    return `${value.format('dddd D MMMM YYYY HH:mm')}\n${value.toISOString()}`;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function run() {
  if (!ns) return;
  error.value = '';
  const keys = Object.keys(ns);
  const vals = Object.values(ns);
  try {
    let result;
    try {
      // ponytail: eval as an expression first; on a syntax error treat it as
      // statements (the user can `return` a value). Client-side toy REPL — the
      // user is running their own code in their own browser.
      result = new Function(...keys, `return (${source.value})`)(...vals);
    } catch (e) {
      if (e instanceof SyntaxError) result = new Function(...keys, source.value)(...vals);
      else throw e;
    }
    output.value = present(result);
  } catch (e) {
    error.value = e && e.message ? e.message : String(e);
  }
}

onMounted(async () => {
  ns = await import('@doranjs/core');
  run();
});
watch(source, run);
</script>

<template>
  <div class="doran-playground">
    <textarea v-model="source" spellcheck="false" rows="3" dir="ltr" aria-label="code" />
    <pre v-if="error" class="dp-out dp-error" dir="ltr">{{ error }}</pre>
    <pre v-else class="dp-out" dir="ltr">{{ output }}</pre>
  </div>
</template>

<style scoped>
.doran-playground {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}
.doran-playground textarea {
  width: 100%;
  padding: 12px;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  color: var(--vp-c-text-1);
}
.doran-playground textarea:focus {
  outline: none;
  background: var(--vp-c-bg);
}
.dp-out {
  margin: 0;
  padding: 12px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
}
.dp-error {
  color: var(--vp-c-danger-1);
}
</style>
