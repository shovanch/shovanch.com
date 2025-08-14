import { useEffect, useState } from 'react';
import { menuItems } from '~/config/site';
import { SocialLinksReact } from './social-links-react';
import { ThemeSwitcher } from './theme-switcher';

type MobileMenuProps = {
  className?: string;
};

export function MobileMenu({ className = '' }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    // Focus trapping logic
    const trapFocus = (event: KeyboardEvent) => {
      if (!isOpen || event.key !== 'Tab') return;

      const modal = document.querySelector('[data-mobile-menu="true"]');
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    const preventTouchMove = (event: TouchEvent) => {
      // Allow scrolling within the menu content, but prevent body scroll
      const target = event.target as Element;
      const menuContent = document.querySelector('[data-menu-content="true"]');

      if (!menuContent?.contains(target)) {
        event.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('keydown', trapFocus);

      // Multiple scroll prevention methods
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
      document.body.style.left = '0';

      // Prevent wheel/touch scroll events
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventTouchMove, {
        passive: false,
      });
      document.addEventListener('scroll', preventScroll, { passive: false });

      // Focus the first focusable element
      setTimeout(() => {
        const modal = document.querySelector('[data-mobile-menu="true"]');
        const firstFocusable = modal?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 100);
    } else {
      // Restore body scroll when menu is closed
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.left = '';

      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('scroll', preventScroll);
      document.removeEventListener('keydown', trapFocus);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('keydown', trapFocus);
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('scroll', preventScroll);

      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.left = '';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
        className={`relative z-[50] flex h-10 w-10 flex-col items-center justify-center rounded-sm transition-all duration-300 hover:bg-gray-800/20 ${
          isOpen ? 'invisible opacity-0' : 'visible opacity-100'
        } ${className}`}
      >
        <div className="relative h-4 w-6">
          <span
            className={`absolute left-0 h-0.5 w-full transition-all duration-300 ease-in-out ${
              isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0.5'
            }`}
            style={{
              borderRadius: '2px',
              backgroundColor: 'var(--theme-text)',
            }}
          />
          <span
            className={`absolute left-0 h-0.5 w-full transition-all duration-300 ease-in-out ${
              isOpen ? 'bottom-1/2 translate-y-1/2 -rotate-45' : 'bottom-0.5'
            }`}
            style={{
              borderRadius: '2px',
              backgroundColor: 'var(--theme-text)',
            }}
          />
        </div>
      </button>

      {/* Mobile Menu Bottom Sheet */}
      <div
        className={`fixed inset-0 z-[51] flex items-end justify-center transition-all duration-300 ease-out ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        aria-hidden={!isOpen}
        data-mobile-menu="true"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black backdrop-blur-sm transition-opacity duration-300 ease-out ${
            isOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />

        {/* Bottom Sheet Panel */}
        <div
          className={`relative w-full max-w-sm transform rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ backgroundColor: 'var(--theme-bg, #fef9f6)' }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="h-1 w-10 rounded-full opacity-30"
              style={{ backgroundColor: 'var(--theme-text, #000)' }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-end px-6 pb-0">
            <button
              onClick={closeMenu}
              aria-label="Close mobile menu"
              className="rounded-full p-2 transition-colors duration-200"
              style={{
                color: 'var(--theme-text-secondary, #666)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--theme-surface, #e5e5e5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div
            className="max-h-[70vh] overflow-y-auto px-6 pb-8"
            data-menu-content="true"
          >
            {/* Navigation links */}
            <nav className="mb-6">
              <div className="space-y-5">
                {menuItems.map((item, index) => (
                  <div
                    key={item.url}
                    className={`transition-all duration-400 ease-out ${
                      isOpen
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-5 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${(index + 1) * 60}ms` : '0ms',
                    }}
                  >
                    <a
                      href={item.url}
                      onClick={closeMenu}
                      className="group block rounded-lg px-4 py-5 font-sans text-lg font-medium lowercase transition-all duration-200"
                      style={{
                        color: 'var(--theme-text, #000)',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          'var(--theme-surface, #e5e5e5)';
                        e.currentTarget.style.color =
                          'var(--theme-highlight, #fbbf24)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--theme-text, #000)';
                      }}
                    >
                      {item.label}
                    </a>
                  </div>
                ))}
              </div>
            </nav>

            {/* Separator */}
            <hr
              className={`border-theme-text-secondary/50 my-6 h-px border-0 transition-all duration-400 ease-out ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
              style={{
                transitionDelay: isOpen
                  ? `${(menuItems.length + 1) * 60}ms`
                  : '0ms',
              }}
            />

            {/* Social links */}
            <div
              className={`mb-6 transition-all duration-400 ease-out ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
              style={{
                transitionDelay: isOpen
                  ? `${(menuItems.length + 2) * 60}ms`
                  : '0ms',
              }}
            >
              <h4
                className="mb-3 font-sans text-sm font-medium tracking-wide uppercase"
                style={{ color: 'var(--theme-text-secondary, #666)' }}
              >
                Connect
              </h4>
              <SocialLinksReact />
            </div>

            {/* Separator */}
            <hr
              className={`border-theme-text-secondary/50 my-6 h-px border-0 transition-all duration-400 ease-out ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
              // style={{
              //   transitionDelay: isOpen
              //     ? `${(menuItems.length + 3) * 60}ms`
              //     : '0ms',
              // }}
            />

            {/* Theme switcher */}
            <div
              className={`transition-all duration-400 ease-out ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
              // style={{
              //   transitionDelay: isOpen
              //     ? `${(menuItems.length + 4) * 60}ms`
              //     : '0ms',
              // }}
            >
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
