import DefaultTheme from 'vitepress/theme';
// Self-hosted Vazirmatn (Persian) — Arabic + Latin subsets, the weights the theme uses.
import '@fontsource/vazirmatn/arabic-400.css';
import '@fontsource/vazirmatn/arabic-500.css';
import '@fontsource/vazirmatn/arabic-700.css';
import '@fontsource/vazirmatn/latin-400.css';
import '@fontsource/vazirmatn/latin-500.css';
import '@fontsource/vazirmatn/latin-700.css';
import './custom.css';
import Playground from './Playground.vue';
import PickerDemo from './PickerDemo.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Playground', Playground);
    app.component('PickerDemo', PickerDemo);
  },
};
