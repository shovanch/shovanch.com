import { useEffect, useState } from 'react';
import type { TocHeading } from '~/utils/toc';

type DynamicTOCProps = {
  headings: TocHeading[];
  readingTime?: string | number;
};

// type HeadingProgress = {
//   id: string;
//   progress: number;
//   isActive: boolean;
// };

export function DynamicTOC({ headings, readingTime }: DynamicTOCProps) {
  const [activeHeading, setActiveHeading] = useState<string>('');
  // const [headingProgress, setHeadingProgress] = useState<
  //   Record<string, HeadingProgress>
  // >({});
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedHeadingIndex, setSelectedHeadingIndex] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [shouldHideTOC, setShouldHideTOC] = useState(false);
  const [hasScrolledPast10Percent, setHasScrolledPast10Percent] =
    useState(false);
  const [hideTimeoutId, setHideTimeoutId] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [showTimeoutId, setShowTimeoutId] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  useEffect(() => {
    // Show TOC after a brief delay
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const calculateProgress = () => {
      // Calculate overall scroll progress
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const pageProgress = Math.min((scrollTop / scrollHeight) * 100, 100);
      setScrollProgress(pageProgress);

      // Check if near bottom (last 10% of document)
      const nearBottom = pageProgress > 90;
      setIsNearBottom(nearBottom);

      // Check if user has scrolled past 10% of viewport
      const viewportHeight = window.innerHeight;
      const scrolledPast10Percent = scrollTop > viewportHeight * 0.1;

      if (!hasScrolledPast10Percent && scrolledPast10Percent) {
        setHasScrolledPast10Percent(true);
      }

      // Detect scroll direction
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollingUp = currentScrollY < lastScrollY;

      // Auto-hide logic with debouncing
      if (hasScrolledPast10Percent || scrolledPast10Percent) {
        if (scrollingUp && shouldHideTOC) {
          // Clear any existing hide timeout
          if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
            setHideTimeoutId(null);
          }

          // Clear any existing show timeout
          if (showTimeoutId) {
            clearTimeout(showTimeoutId);
          }

          // Debounce showing the TOC after scrolling up
          const showTimeout = setTimeout(() => {
            setShouldHideTOC(false);
            setShowTimeoutId(null);
          }, 300); // 300ms debounce

          setShowTimeoutId(showTimeout);
        } else if (scrollingDown && !shouldHideTOC) {
          // Clear any existing show timeout when scrolling down
          if (showTimeoutId) {
            clearTimeout(showTimeoutId);
            setShowTimeoutId(null);
          }

          // Clear any existing hide timeout
          if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
          }

          // Set timeout to hide after 5 seconds of scrolling down
          const hideTimeout = setTimeout(() => {
            setShouldHideTOC(true);
            setHideTimeoutId(null);
          }, 5000);

          setHideTimeoutId(hideTimeout);
        }
      }

      if (scrollingDown !== isScrollingDown && (scrollingDown || scrollingUp)) {
        setIsScrollingDown(scrollingDown);
      }
      setLastScrollY(currentScrollY);

      // Find active heading and its index
      const headingElements = headings
        .map((h) => document.getElementById(h.slug))
        .filter(Boolean);

      let activeHeadingId = '';
      let activeIndex = 0;
      for (let i = 0; i < headingElements.length; i++) {
        const element = headingElements[i];
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.3) {
          activeHeadingId = element.id;
          activeIndex = i;
        }
      }

      if (activeHeadingId) {
        setActiveHeading(activeHeadingId);
        setSelectedHeadingIndex(activeIndex);
      }
    };

    // Comment out the detailed progress calculation for potential future use
    // const calculateDetailedProgress = () => {
    //   const headingElements = headings
    //     .map((h) => document.getElementById(h.slug))
    //     .filter(Boolean);
    //   const progress: Record<string, HeadingProgress> = {};

    //   headingElements.forEach((element, index) => {
    //     if (!element) return;

    //     const rect = element.getBoundingClientRect();
    //     const windowHeight = window.innerHeight;
    //     const elementTop = rect.top;
    //     const elementHeight = rect.height;

    //     let progressValue = 0;
    //     if (elementTop < windowHeight * 0.3) {
    //       const nextElement = headingElements[index + 1];
    //       if (nextElement) {
    //         const nextRect = nextElement.getBoundingClientRect();
    //         const sectionHeight = nextRect.top - elementTop;
    //         const scrolled = windowHeight * 0.3 - elementTop;
    //         progressValue = Math.min(Math.max(scrolled / sectionHeight, 0), 1);
    //       } else {
    //         const docHeight = document.documentElement.scrollHeight;
    //         const scrollTop = window.pageYOffset;
    //         const remainingScroll = docHeight - scrollTop - windowHeight;
    //         progressValue =
    //           remainingScroll <= 0
    //             ? 1
    //             : Math.max(0, 1 - remainingScroll / windowHeight);
    //       }
    //     }

    //     progress[element.id] = {
    //       id: element.id,
    //       progress: progressValue,
    //       isActive:
    //         elementTop <= windowHeight * 0.3 && elementTop >= -elementHeight,
    //     };
    //   });

    //   setHeadingProgress(progress);
    // };

    const handleScroll = () => {
      requestAnimationFrame(calculateProgress);
    };

    calculateProgress();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', calculateProgress);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateProgress);
      if (hideTimeoutId) {
        clearTimeout(hideTimeoutId);
      }
      if (showTimeoutId) {
        clearTimeout(showTimeoutId);
      }
    };
  }, [
    headings,
    lastScrollY,
    isScrollingDown,
    hasScrolledPast10Percent,
    shouldHideTOC,
    hideTimeoutId,
    showTimeoutId,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation when TOC is visible and not typing in inputs
      if (
        !isVisible ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          if (selectedHeadingIndex > 0) {
            const newIndex = selectedHeadingIndex - 1;
            const heading = headings[newIndex];
            if (heading) {
              handleHeadingClick(heading.slug);
              setSelectedHeadingIndex(newIndex);
            }
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (selectedHeadingIndex < headings.length - 1) {
            const newIndex = selectedHeadingIndex + 1;
            const heading = headings[newIndex];
            if (heading) {
              handleHeadingClick(heading.slug);
              setSelectedHeadingIndex(newIndex);
            }
          }
          break;
        case 'Enter':
          event.preventDefault();
          const currentHeading = headings[selectedHeadingIndex];
          if (currentHeading) {
            handleHeadingClick(currentHeading.slug);
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (isMobileOpen) {
            setIsMobileOpen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedHeadingIndex, headings, isMobileOpen]);

  const handleHeadingClick = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const renderHeading = (heading: TocHeading, level: number = 0) => {
    const isActive = activeHeading === heading.slug;

    return (
      <li key={heading.slug} className={`relative toc-level-${level}`}>
        <div className="relative">
          {/* Simple active indicator */}
          <div
            className={`absolute top-0 left-0 w-0.5 transition-all duration-300 ease-out ${
              isActive
                ? 'bg-blue-500 opacity-100'
                : 'bg-theme-border opacity-40'
            }`}
            style={{ height: '100%' }}
          />

          {/* Heading link */}
          <button
            onClick={() => handleHeadingClick(heading.slug)}
            className={`group block w-full rounded-r-md py-1 pr-2 pl-4 text-left text-sm transition-all duration-200 hover:bg-blue-50/50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 ${
              isActive
                ? 'bg-blue-50/70 font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                : 'text-theme-text-secondary'
            } ${level > 0 ? 'ml-4' : ''}`}
            aria-current={isActive ? 'location' : undefined}
            aria-label={`Go to section: ${heading.text}`}
          >
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              {heading.text}
            </span>
          </button>
        </div>

        {/* Child headings */}
        {heading.children && heading.children.length > 0 && (
          <ul className="mt-1">
            {heading.children.map((child) => renderHeading(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  // Only show TOC if article has 3+ headings or reading time > 5 minutes
  const shouldShowTOC = () => {
    if (headings.length < 3) return false;

    // if (readingTime) {
    //   const minutes =
    //     typeof readingTime === 'number'
    //       ? readingTime
    //       : parseInt(readingTime.match(/\d+/)?.[0] || '0');
    //   return minutes >= 5;
    // }

    return true; // Show if we can't determine reading time
  };

  if (headings.length === 0 || !shouldShowTOC()) return null;

  return (
    <>
      {/* Desktop TOC */}
      <nav
        className={`fixed bottom-6 left-6 z-10 max-w-64 transition-all duration-500 ease-out ${
          isVisible && !isNearBottom
            ? 'translate-x-0 opacity-100'
            : '-translate-x-4 opacity-0'
        } hidden xl:block`}
        aria-label="Table of contents"
        role="navigation"
      >
        <div className="max-h-[70vh] w-full overflow-x-hidden overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb:hover]:bg-gray-500 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-500 [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="mb-3 -ml-1.5 flex items-center gap-2">
            {/* Simple circular progress indicator */}
            <div className="relative h-4 w-4">
              <svg
                className="h-full w-full -rotate-90 transform"
                viewBox="0 0 32 32"
              >
                {/* Background circle */}
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-theme-border"
                />
                {/* Progress circle */}
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="text-blue-500 transition-all duration-300"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 14}`,
                    strokeDashoffset: `${2 * Math.PI * 14 * (1 - scrollProgress / 100)}`,
                  }}
                />
              </svg>
            </div>
            <h3 className="text-theme-text text-sm font-semibold">
              On this page
            </h3>
          </div>
          <ul className="space-y-1">
            {headings.map((heading) => renderHeading(heading))}
          </ul>
        </div>
      </nav>

      {/* Mobile TOC */}
      <div className="xl:hidden">
        {/* Mobile TOC Toggle Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={`bg-theme-text text-theme-bg fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:opacity-80 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
            shouldHideTOC && !isMobileOpen
              ? 'scale-90 opacity-50'
              : 'scale-100 opacity-100'
          }`}
          aria-label={
            isMobileOpen ? 'Close table of contents' : 'Open table of contents'
          }
          aria-expanded={isMobileOpen}
          aria-controls="mobile-toc-panel"
        >
          <svg
            className="h-6 w-6 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 6h13M8 12h13M8 18h13"
                />
                <circle cx="4" cy="6.5" r="1" fill="currentColor" />
                <circle cx="4" cy="12" r="1" fill="currentColor" />
                <circle cx="4" cy="18" r="1" fill="currentColor" />
              </>
            )}
          </svg>
        </button>

        {/* Mobile TOC Panel */}
        <div
          className={`fixed inset-0 z-40 flex items-end justify-center transition-all duration-300 ease-out ${
            isMobileOpen ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${
              isMobileOpen ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={() => setIsMobileOpen(false)}
          />

          {/* TOC Panel */}
          <div
            id="mobile-toc-panel"
            className={`bg-theme-bg relative w-full max-w-sm transform rounded-t-lg p-6 shadow-xl transition-transform duration-300 ease-out ${
              isMobileOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Table of contents"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-theme-text text-lg font-semibold">
                On this page
              </h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <ul className="space-y-2">
                {headings.map((heading) => (
                  <li key={heading.slug}>
                    <button
                      onClick={() => {
                        handleHeadingClick(heading.slug);
                        setIsMobileOpen(false);
                      }}
                      className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                        activeHeading === heading.slug
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-theme-text-secondary hover:bg-theme-surface'
                      }`}
                      aria-current={
                        activeHeading === heading.slug ? 'location' : undefined
                      }
                      aria-label={`Go to section: ${heading.text}`}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
