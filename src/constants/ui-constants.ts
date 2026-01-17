// Shared UI constants for consistent styling
export const UI_CONSTANTS = {
  // Icon sizes
  ICON_SIZES: {
    default: 'w-6 h-6 md:w-8 md:h-8',
    small: 'h-5 w-5',
    large: 'w-8 h-8 md:w-10 md:h-10',
  },

  // Common spacing
  SPACING: {
    container: 'mx-auto max-w-3xl px-6',
    section: 'py-8 md:py-12',
  },

  // Animation classes
  ANIMATIONS: {
    fadeIn: 'opacity-0 animate-fade-in',
    slideUp: 'translate-y-4 opacity-0 animate-slide-up',
  },

  // Prose styling for content
  PROSE: {
    default:
      'prose prose-lg md:prose-xl prose-headings:text-lg md:prose-headings:text-xl prose-headings:font-sans prose-headings:text-semibold prose-headings:scroll-mt-8 prose-a:!decoration-dashed prose-h2:mt-10 prose-h2:md:mt-14 prose-a:!underline prose-a:!underline-offset-4 prose-img:rounded-md prose-img:w-full prose-strong:text-theme-text prose-hr:border-theme-text-secondary/40 prose-img:shadow-md max-w-none text-pretty prose-li:marker:text-theme-text-secondary',
  },
} as const;
