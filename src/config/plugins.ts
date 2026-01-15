/**
 * Unified plugin configuration for Astro
 * Centralizes all remark and rehype plugin registrations
 */
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';

// Custom plugins
import { rehypeImageCaptions } from '../libs/rehype-image-captions';
import { rehypeRawHtmlInCode } from '../libs/rehype-raw-html-in-code';
import { rehypeToc } from '../libs/rehype-toc';
import { remarkSidenotes } from '../libs/remark-sidenotes';
import { remarkWikilinksSimple } from '../libs/remark-wikilinks-simple.js';

// Plugin configurations
export const remarkPlugins = [remarkWikilinksSimple, remarkSidenotes];

export const rehypePlugins: any[] = [
  rehypeToc,
  rehypeHeadingIds,
  [
    rehypeAutolinkHeadings,
    {
      behavior: 'append',
      content: {
        type: 'text',
        value: '#',
      },
      properties: {
        ariaHidden: true,
        tabIndex: -1,
        className: 'header-anchor',
      },
    },
  ],
  rehypeRawHtmlInCode,
  rehypeImageCaptions,
];

// ExpressiveCode configuration
export const expressiveCodeConfig = {
  themes: ['night-owl'],
  plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
  styleOverrides: {
    codeFontFamily: 'var(--font-mono)',
    codeFontSize: '1rem',
  },
  useThemedScrollbars: true,
  useThemedSelectionColors: true,
  defaultProps: {
    wrap: true,
  },
};
