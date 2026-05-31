import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Doran',
  description: 'The Open Source Persian Calendar Ecosystem',
  lang: 'en-US',
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
          { text: '@doran/core', link: '/api/core' },
          { text: '@doran/nlp', link: '/api/nlp' },
          { text: '@doran/holidays', link: '/api/holidays' },
          { text: '@doran/react', link: '/api/react' },
          { text: '@doran/ui', link: '/api/ui' },
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
            { text: '@doran/core', link: '/api/core' },
            { text: '@doran/nlp', link: '/api/nlp' },
            { text: '@doran/holidays', link: '/api/holidays' },
            { text: '@doran/react', link: '/api/react' },
            { text: '@doran/ui', link: '/api/ui' },
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
