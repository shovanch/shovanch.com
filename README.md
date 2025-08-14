# shovanch.com

This is the source code for my personal website and blog at [shovanch.com](https://shovanch.com). Built with Astro 5, it features a modern architecture with dual content systems, Obsidian integration, and performance optimizations.

**Note**: All content, posts, and notes in this repository are my personal work. Feel free to use the codebase as a template, but please replace all content with your own.

## Features

- **Modern Stack**: Built with Astro 5, React 19, TypeScript, and Tailwind CSS v4
- **Dual Content System**: Blog posts and Obsidian notes managed as separate git submodules
- **Interactive Code Editors**: Embedded Sandpack code playgrounds for live coding examples
- **Obsidian Integration**: Seamless wikilink support and automatic image syncing from Obsidian vault
- **Dynamic OG Images**: Auto-generated social media previews using `@vercel/og`
- **Search**: Full-text search powered by Pagefind
- **Dark Mode**: Persistent theme switching with system preference detection
- **Performance**: Optimized with code splitting, image optimization, and lazy loading
- **RSS & Sitemap**: Auto-generated feeds and sitemaps
- **Code Highlighting**: Syntax highlighting with Expressive Code
- **Typography**: Beautiful typography with custom fonts and responsive design

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/shovanch/shovanch.com.git
cd shovanch.com

# Install dependencies
pnpm install

# Initialize git submodules (for Obsidian notes and blog posts)
pnpm run submodule-init

# Start development server
pnpm run dev
```

The site will be available at `http://localhost:4321`

### Customization for Your Own Site

To adapt this codebase for your own website, you'll need to update several configuration files:

#### 1. Site Configuration (`src/config/site.ts`)

```typescript
export const siteConfig = {
  url: 'https://yoursite.com', // Your domain
  title: 'Your Name', // Your name/site title
  description: 'Your site description', // SEO description
  author: 'Your Name', // Author name
  email: 'your@email.com', // Your email
} as const;

export const navigationConfig = {
  mainMenu: [
    { label: 'home', url: '/' },
    { label: 'posts', url: '/posts' },
    { label: 'notes', url: '/notes' }, // Remove if not using Obsidian
    { label: 'about', url: '/about' },
  ],
  socialLinks: [
    { label: 'email', url: `mailto:your@email.com` },
    { label: 'github', url: 'https://github.com/yourusername' },
    { label: 'linkedin', url: 'https://www.linkedin.com/in/yourusername' },
    { label: 'twitter', url: 'https://x.com/yourusername' },
    { label: 'rss', url: `https://yoursite.com/rss.xml` },
  ],
} as const;
```

#### 2. Astro Configuration (`astro.config.mjs`)

```javascript
export default defineConfig({
  site: 'https://yoursite.com', // Update to your domain
  // ... rest of config
});
```

#### 3. Package.json

```json
{
  "name": "your-site-name"
  // Update name, description, repository, etc.
}
```

#### 4. Content Replacement

- **Replace blog posts**: Both content collections are git submodules:
  - `src/content/posts/` - Replace with your own blog posts repository
  - `src/content/notes/` - Replace with your Obsidian vault (or remove if not needed)
- **Update submodule URLs**: Modify `.gitmodules` to point to your repositories
- **Update about page**: Modify `src/pages/about.astro` with your information
- **Replace images**: Update images in `public/images/` with your own
- **Update fonts**: Replace custom fonts in `public/fonts/` if desired

#### 5. Styling Customization

- **Colors**: Modify Tailwind configuration for your color scheme
- **Fonts**: Update font references in CSS files if changing fonts
- **Layout**: Customize components in `src/components/` and layouts in `src/layouts/`

#### 6. Submodule Management (Optional)

**To remove content collections you don't need:**

For Obsidian notes (if not using):

1. Remove the notes collection from `src/content.config.ts`
2. Delete notes-related pages in `src/pages/notes/`
3. Remove Obsidian scripts from `package.json`
4. Update navigation to remove notes links
5. Remove git submodule: `git submodule deinit src/content/notes`

For blog posts submodule (if using inline content):

1. Remove git submodule: `git submodule deinit src/content/posts`
2. Create `src/content/posts/` directory and add your MDX files directly

**To add your own submodules:**

1. Remove existing submodules: `git submodule deinit --all`
2. Add your repositories: `git submodule add <your-repo-url> src/content/posts`
3. Update `.gitmodules` with your repository URLs
4. Configure authentication in Vercel for private repositories

## Development Commands

| Command               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `pnpm run dev`        | Start development server (syncs Obsidian images first) |
| `pnpm run build`      | Build for production                                   |
| `pnpm run preview`    | Preview production build locally                       |
| `pnpm run prod`       | Build and preview in one command                       |
| `pnpm run type-check` | Run TypeScript type checking                           |
| `pnpm run format`     | Format code with Prettier                              |
| `pnpm run test`       | Run tests with Vitest                                  |

## Project Structure

```
src/
├── components/          # Reusable Astro and React components
├── content/
│   ├── posts/          # Blog posts in MDX format (git submodule)
│   └── notes/          # Obsidian notes (git submodule)
├── layouts/            # Page layouts
├── pages/              # Route pages
├── utils/              # Utility functions
├── styles/             # Global CSS styles
└── config/             # Configuration files

public/
├── fonts/              # Custom web fonts
├── images/             # Static images
└── notes/assets/       # Synced Obsidian images
```

## Content Management

**Interactive Code Examples:**

You can embed live code editors using Sandpack for interactive examples:

```jsx
import { CodePlayground } from '~/components/code-playground';

<CodePlayground
  files={{
    '/App.js': `
import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
    `,
  }}
  template="react"
/>;
```

### Obsidian Integration

The project supports Obsidian-style markdown with automatic processing:

- **Wikilinks**: `[[Page Name]]` → converted to proper links
- **Image embeds**: `![[image.jpg]]` → automatically processed
- **Highlighting**: `==highlighted text==` → `<mark>` tags
- **Smart captions**: Intelligent caption detection for images

Place Obsidian images in `src/content/notes/assets/` and they'll be automatically synced to the public directory.

## Advanced Customization

### Styling

The project uses Tailwind CSS v4 with:

- Custom fonts (Source Serif 4, Uncut Sans, Fira Code)
- Dark mode support
- Typography plugin for prose styling
- Custom component styles

### Configuration

Key configuration files:

- `astro.config.mjs` - Astro configuration
- `src/config/site.ts` - Site metadata and settings
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## Deployment

### Vercel (Recommended)

The project is optimized for Vercel deployment with enhanced submodule support:

1. Connect your repository to Vercel
2. Set environment variables:
   - `GITHUB_PAT` - GitHub Personal Access Token for private submodules
3. Configure build settings:
   - Build Command: `pnpm run build` (uses custom `scripts/vercel-build.sh`)
   - The build script automatically handles authentication for both public and private submodules
4. Deploy automatically on push

**Private Submodule Authentication:**
The custom Vercel build script (`scripts/vercel-build.sh`) automatically configures authentication for private GitHub repositories using your `GITHUB_PAT` environment variable. This allows seamless deployment of sites using private content repositories.

### Other Platforms

The project generates static files and can be deployed to any static hosting service:

```bash
pnpm run build
# Deploy the dist/ folder
```

## Advanced Features

### Dynamic OG Images

Social media previews are automatically generated for each blog post using `@vercel/og`. Images are created at build time and served from `/posts/[slug]/og.png`.

### Search

Full-text search is powered by Pagefind, which indexes all content at build time and provides fast, client-side search.

### RSS Feed

An RSS feed is automatically generated at `/rss.xml` including all published blog posts.

### Analytics & Performance

- Built-in Astro analytics support
- Optimized images with `sharp`
- Code splitting and lazy loading
- Performance monitoring ready

## Development

### Code Style

The project uses Prettier with:

- Double quotes and semicolons
- Auto-import organization
- Tailwind class sorting

Format code: `pnpm run format`

### Testing

Tests are written with Vitest:

```bash
pnpm run test        # Run tests in watch mode
pnpm run test:run    # Run tests once
```

### Type Checking

```bash
pnpm run type-check  # Check TypeScript types
```

## Tech Stack

- **Framework**: [Astro 5](https://astro.build/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Content**: [MDX](https://mdxjs.com/) with content collections
- **Deployment**: [Vercel](https://vercel.com/)
- **Search**: [Pagefind](https://pagefind.app/)
- **Code Highlighting**: [Expressive Code](https://expressive-code.com/)
- **Interactive Code**: [Sandpack](https://sandpack.codesandbox.io/) for embedded code playgrounds
- **OG Images**: [@vercel/og](https://vercel.com/docs/functions/edge-functions/og-image-generation)

## License

This project is open source and available under the [MIT License](LICENSE).

**Content License**: All blog posts, notes, and personal content in this repository are copyrighted by Shovan Chatterjee. The code and structure are freely available, but please replace all content with your own.

## Contributing

This is primarily a personal website, but contributions to improve the codebase are welcome! Please feel free to submit a Pull Request for:

- Bug fixes
- Performance improvements
- New features that would benefit the template
- Documentation improvements

### Contributing Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Run the quality checks:
   ```bash
   pnpm run type-check
   pnpm run lint
   pnpm run format
   pnpm run test
   ```
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Submit a pull request

## Contact

- **Website**: [shovanch.com](https://shovanch.com)
- **GitHub**: [@shovanch](https://github.com/shovanch)
- **Email**: [hello@shovanch.com](mailto:hello@shovanch.com)

---

Built with ❤️ using Astro and modern web technologies.
