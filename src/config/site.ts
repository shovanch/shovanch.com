/**
 * Centralized site configuration
 * All site-wide settings, metadata, and constants in one place
 */

export type Theme = 'light' | 'dark' | 'blue';
export type ContentType = 'post' | 'note';

export type SiteMeta = {
  title: string;
  description: string;
  url: string;
  ogImage: string;
};

// Navigation types
export type MenuItem = {
  label: string;
  url: string;
};

export type SocialLink = {
  label: string;
  url: string;
};

// Site metadata and SEO configuration
export const siteConfig = {
  url: 'https://shovanch.com',
  title: 'Shovan Chatterjee',
  description: 'Notes on Programming',
  author: 'Shovan Chatterjee',
  email: 'hello@shovanch.com',
} as const;

export const defaultMeta: SiteMeta = {
  url: siteConfig.url,
  title: siteConfig.title,
  description: siteConfig.description,
  ogImage: `${siteConfig.url}/og`,
};

// Navigation configuration
export const navigationConfig = {
  mainMenu: [
    { label: 'home', url: '/' },
    { label: 'posts', url: '/posts' },
    { label: 'notes', url: '/notes' },
    { label: 'about', url: '/about' },
  ],
  socialLinks: [
    { label: 'email', url: `mailto:${siteConfig.email}` },
    { label: 'github', url: 'https://github.com/shovanch' },
    { label: 'linkedin', url: 'https://www.linkedin.com/in/shovanch' },
    { label: 'twitter', url: 'https://x.com/shovan_ch' },
    { label: 'rss', url: `${siteConfig.url}/rss.xml` },
  ],
} as const;

// Content configuration
export const contentConfig = {
  postsPerPage: 10,
  excerptLength: 200,
  readingTimeWordsPerMinute: 200,
  dateFormat: 'MMM dd, yyyy',
  defaultTags: [] as string[],
} as const;

// Performance configuration
export const performanceConfig = {
  imageFormats: ['webp', 'avif', 'jpg'] as const,
  imageSizes: [320, 640, 960, 1280, 1600] as const,
  cacheMaxAge: 31536000, // 1 year in seconds
  prefetchStrategy: 'viewport' as const,
} as const;

// Re-export for backward compatibility (from the old data/index.ts)
export const menuItems: MenuItem[] = [...navigationConfig.mainMenu];
export const socialLinks: SocialLink[] = [...navigationConfig.socialLinks];
