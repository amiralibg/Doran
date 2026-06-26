import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Doran',
  description: 'The Open Source Persian Calendar Ecosystem',
  // Served from https://amiralibg.github.io/Doran/ — assets need this base path.
  base: '/Doran/',
  lastUpdated: true,
  cleanUrls: true,

  // Farsi is the default (root) locale; English lives under /en/.
  locales: {
    root: {
      label: 'فارسی',
      lang: 'fa-IR',
      dir: 'rtl',
      title: 'دوران',
      description: 'اکوسیستم متن‌باز تقویم فارسی',
      themeConfig: {
        nav: [
          { text: 'راهنما', link: '/guide/getting-started' },
          { text: 'API', link: '/api/core' },
          { text: 'نمونه‌ها', link: '/examples' },
          {
            text: 'دموها',
            items: [
              { text: 'دموی ری‌اکت', link: 'https://amiralibg.github.io/Doran/examples/react/' },
              { text: 'دموی وانیلا', link: 'https://amiralibg.github.io/Doran/examples/vanilla/' },
            ],
          },
          {
            text: 'بسته‌ها',
            items: [
              { text: '@doranjs/core', link: '/api/core' },
              { text: '@doranjs/nlp', link: '/api/nlp' },
              { text: '@doranjs/holidays', link: '/api/holidays' },
              { text: '@doranjs/react', link: '/api/react' },
              { text: '@doranjs/wc', link: '/api/wc' },
              { text: '@doranjs/ui', link: '/api/ui' },
            ],
          },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'مقدمه',
              items: [
                { text: 'شروع به کار', link: '/guide/getting-started' },
                { text: 'Backendها و سریال‌سازی', link: '/guide/backends' },
                { text: 'تست با دوران', link: '/guide/testing' },
                { text: 'معماری', link: '/guide/architecture' },
                { text: 'راهنمای مهاجرت', link: '/guide/migration' },
              ],
            },
          ],
          '/api/': [
            {
              text: 'مرجع API',
              items: [
                { text: '@doranjs/core', link: '/api/core' },
                { text: '@doranjs/nlp', link: '/api/nlp' },
                { text: '@doranjs/holidays', link: '/api/holidays' },
                { text: '@doranjs/react', link: '/api/react' },
                { text: '@doranjs/wc', link: '/api/wc' },
                { text: '@doranjs/ui', link: '/api/ui' },
              ],
            },
          ],
        },
        docFooter: { prev: 'صفحهٔ قبل', next: 'صفحهٔ بعد' },
        outline: { label: 'در این صفحه' },
        returnToTopLabel: 'بازگشت به بالا',
        sidebarMenuLabel: 'منو',
        darkModeSwitchLabel: 'حالت تیره',
        langMenuLabel: 'تغییر زبان',
      },
    },

    en: {
      label: 'English',
      lang: 'en-US',
      dir: 'ltr',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'API', link: '/en/api/core' },
          { text: 'Examples', link: '/en/examples' },
          {
            text: 'Demos',
            items: [
              { text: 'React demo', link: 'https://amiralibg.github.io/Doran/examples/react/' },
              { text: 'Vanilla demo', link: 'https://amiralibg.github.io/Doran/examples/vanilla/' },
            ],
          },
          {
            text: 'Packages',
            items: [
              { text: '@doranjs/core', link: '/en/api/core' },
              { text: '@doranjs/nlp', link: '/en/api/nlp' },
              { text: '@doranjs/holidays', link: '/en/api/holidays' },
              { text: '@doranjs/react', link: '/en/api/react' },
              { text: '@doranjs/wc', link: '/en/api/wc' },
              { text: '@doranjs/ui', link: '/en/api/ui' },
            ],
          },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Getting Started', link: '/en/guide/getting-started' },
                { text: 'Backends & serialization', link: '/en/guide/backends' },
                { text: 'Testing with Doran', link: '/en/guide/testing' },
                { text: 'Architecture', link: '/en/guide/architecture' },
                { text: 'Migration Guide', link: '/en/guide/migration' },
              ],
            },
          ],
          '/en/api/': [
            {
              text: 'API Reference',
              items: [
                { text: '@doranjs/core', link: '/en/api/core' },
                { text: '@doranjs/nlp', link: '/en/api/nlp' },
                { text: '@doranjs/holidays', link: '/en/api/holidays' },
                { text: '@doranjs/react', link: '/en/api/react' },
                { text: '@doranjs/wc', link: '/en/api/wc' },
                { text: '@doranjs/ui', link: '/en/api/ui' },
              ],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/amiralibg/Doran' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Doran Contributors',
    },

    search: { provider: 'local' },
  },
});
