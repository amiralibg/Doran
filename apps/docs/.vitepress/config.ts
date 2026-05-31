import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Doran',
  description: 'The Open Source Persian Calendar Ecosystem',
  lang: 'en-US',
  // Served from https://amiralibg.github.io/Doran/ — assets need this base path.
  base: '/Doran/',
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: 'Examples', link: '/examples' },
      {
        text: 'Packages',
        items: [
          { text: '@doranjs/core', link: '/api/core' },
          { text: '@doranjs/nlp', link: '/api/nlp' },
          { text: '@doranjs/holidays', link: '/api/holidays' },
          { text: '@doranjs/react', link: '/api/react' },
          { text: '@doranjs/ui', link: '/api/ui' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Migration Guide', link: '/guide/migration' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: '@doranjs/core', link: '/api/core' },
            { text: '@doranjs/nlp', link: '/api/nlp' },
            { text: '@doranjs/holidays', link: '/api/holidays' },
            { text: '@doranjs/react', link: '/api/react' },
            { text: '@doranjs/ui', link: '/api/ui' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/amiralibg/Doran' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Doran Contributors',
    },

    search: { provider: 'local' },
  },
});
