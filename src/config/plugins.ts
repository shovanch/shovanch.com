/**
 * Unified plugin configuration for Astro
 * Centralizes all remark and rehype plugin registrations
 */
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// Custom plugins
import { rehypeExternalLinks } from '../libs/rehype-external-links';
import { rehypeImageCaptions } from '../libs/rehype-image-captions';
import { rehypeRawHtmlInCode } from '../libs/rehype-raw-html-in-code';
import { rehypeToc } from '../libs/rehype-toc';
import { remarkCallouts } from '../libs/remark-callouts';
import { remarkSidenotes } from '../libs/remark-sidenotes';
import { remarkWikilinksSimple } from '../libs/remark-wikilinks-simple.js';

// Plugin configurations
// Note: remarkCallouts must come before remarkSidenotes to process callouts first
export const remarkPlugins = [
  remarkWikilinksSimple,
  remarkCallouts,
  remarkSidenotes,
];

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
  rehypeExternalLinks,
];

// ExpressiveCode configuration
export const expressiveCodeConfig = {
  themes: ['github-dark-default'],
  plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
  styleOverrides: {
    codeFontFamily: 'var(--font-mono)',
    codeFontSize: '1rem',
    borderRadius: '0.5rem',
    uiFontFamily: 'var(--font-mono)',
    frames: {
      editorTabBarBackground: '#21262d',
      editorActiveTabBackground: '#21262d',
      editorActiveTabForeground: '#e6edf3',
      editorActiveTabBorderColor: 'transparent',
      editorActiveTabIndicatorTopColor: 'transparent',
      editorActiveTabIndicatorBottomColor: 'transparent',
      editorTabBorderRadius: '0',
      editorTabBarBorderBottomColor: '#30363d',
      // Copy button
      inlineButtonBackgroundIdleOpacity: '0',
      inlineButtonBackgroundHoverOrFocusOpacity: '0.2',
    },
  },
  useThemedScrollbars: true,
  useThemedSelectionColors: true,
  defaultProps: {
    wrap: true,
  },
};
