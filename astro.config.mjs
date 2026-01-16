// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import pagefind from 'astro-pagefind';
import { defineConfig } from 'astro/config';
import {
  expressiveCodeConfig,
  rehypePlugins,
  remarkPlugins,
} from './src/config/plugins.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://shovanch.com',
  build: {
    format: 'directory',
    // Inline all styles to eliminate render-blocking CSS
    inlineStylesheets: 'always',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  experimental: {
    contentIntellisense: true,
    clientPrerender: true,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Improve tree shaking
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate large vendor libraries
            sandpack: [
              '@codesandbox/sandpack-react',
              '@codesandbox/sandpack-themes',
            ],
            // Group React-related dependencies
            react: ['react', 'react-dom'],
            // Group utility libraries
            utils: ['unist-util-visit', 'hast-util-find-and-replace'],
          },
        },
      },
    },
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  markdown: {
    syntaxHighlight: false, // Let ExpressiveCode handle this
    remarkPlugins,
    rehypePlugins,
  },

  integrations: [
    // @ts-ignore
    expressiveCode(expressiveCodeConfig),
    mdx(),
    react(),
    sitemap(),
    pagefind(),
  ],
});
