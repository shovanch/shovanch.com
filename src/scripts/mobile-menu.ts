class MobileMenu {
  private isOpen = false;
  private menuButton: HTMLElement | null = null;
  private menuOverlay: HTMLElement | null = null;
  private menuCloseButton: HTMLElement | null = null;
  private menuLinks: NodeListOf<HTMLElement> | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () =>
        this.setupEventListeners(),
      );
    } else {
      this.setupEventListeners();
    }
  }

  private setupEventListeners(): void {
    this.menuButton = document.getElementById('mobile-menu-button');
    this.menuOverlay = document.getElementById('mobile-menu-overlay');
    this.menuCloseButton = document.getElementById('mobile-menu-close');
    this.menuLinks = document.querySelectorAll('.mobile-menu-link');

    if (!this.menuButton || !this.menuOverlay || !this.menuCloseButton) {
      return;
    }

    // Toggle menu on hamburger button click
    this.menuButton.addEventListener('click', () => this.toggleMenu());

    // Close menu on close button click
    this.menuCloseButton.addEventListener('click', () => this.closeMenu());

    // Close menu on backdrop click
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeMenu());
    }

    // Close menu on menu link click
    this.menuLinks?.forEach((link) => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });

    // Handle focus trapping when menu is open
    document.addEventListener('keydown', (e) => this.handleFocusTrap(e));
  }

  private toggleMenu(): void {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private openMenu(): void {
    if (!this.menuOverlay || !this.menuButton) return;

    this.isOpen = true;
    document.body.classList.add('mobile-menu-open');

    // Update ARIA attributes
    this.menuButton.setAttribute('aria-expanded', 'true');
    this.menuOverlay.setAttribute('aria-hidden', 'false');

    // Reset menu link animations
    const menuWrappers = document.querySelectorAll('.menu-link-wrapper');
    menuWrappers.forEach((wrapper) => {
      const element = wrapper as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
    });

    // Focus on close button for accessibility
    setTimeout(() => {
      this.menuCloseButton?.focus();
    }, 100);
  }

  private closeMenu(): void {
    if (!this.menuOverlay || !this.menuButton) return;

    this.isOpen = false;
    document.body.classList.remove('mobile-menu-open');

    // Update ARIA attributes
    this.menuButton.setAttribute('aria-expanded', 'false');
    this.menuOverlay.setAttribute('aria-hidden', 'true');

    // Return focus to hamburger button
    this.menuButton.focus();
  }

  private handleFocusTrap(e: KeyboardEvent): void {
    if (!this.isOpen || e.key !== 'Tab') return;

    const focusableElements = this.menuOverlay?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
}

// Initialize mobile menu
new MobileMenu();
